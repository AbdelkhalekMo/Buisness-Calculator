// Price constants and configuration
const PRICING = {
    wood: {
        unitSize: 10, // 10cm x 10cm
        unitPrice: 5, // 5 L.E per unit
    },
    acrylic: {
        unitSize: 5, // 5cm x 5cm
        unitPrice: 4, // 4 L.E per unit
    },
    frame: {
        unitSize: 5, // 5cm x 5cm
        unitPrice: 1, // 1 L.E per unit 
    },
    accessories: {
        names: { name: "أسماء", price: 10 },
        cutSentence: { name: "جملة مقطوعة", price: 10 },
        engravedSentence: { name: "جملة محفورة", price: 15 },
        fingerprints: { name: "أماكن بصمات", price: 10 },
        acrylicBox: { name: "صندوق أكريليك", price: 50 }
    },
    secondLayerDiscount: 0.33 // 33% discount
};

// DOM elements
const elements = {
    productType: document.querySelectorAll('input[name="productType"]'),
    length: document.getElementById('length'),
    width: document.getElementById('width'),
    withFrame: document.getElementById('withFrame'),
    twoLayers: document.getElementById('twoLayers'),
    thickness43ml: document.getElementById('thickness43ml'),
    forShop: document.getElementById('forShop'),
    accessorySelect: document.getElementById('accessorySelect'),
    selectedAccessories: document.getElementById('selectedAccessories'),
    totalPrice: document.getElementById('totalPrice')
};

// Global state
let state = {
    productType: 'wood',
    length: 0,
    width: 0,
    withFrame: false,
    twoLayers: false,
    thickness43ml: false,
    forShop: false,
    accessories: [],
    totalPrice: 0
};

// Utility functions
function ceilToPricingUnit(dimension, unitSize) {
    return Math.ceil(dimension / unitSize) * unitSize;
}

function calculateBasePrice() {
    const pricing = PRICING[state.productType];
    
    // Calculate adjusted dimensions (ceiling to nearest unit)
    const adjustedLength = ceilToPricingUnit(state.length, pricing.unitSize);
    const adjustedWidth = ceilToPricingUnit(state.width, pricing.unitSize);
    
    // Calculate units (how many pricing units fit in the area)
    const unitsLength = adjustedLength / pricing.unitSize;
    const unitsWidth = adjustedWidth / pricing.unitSize;
    
    // Calculate total units and price for first layer
    const totalUnits = unitsLength * unitsWidth;
    let basePrice = totalUnits * pricing.unitPrice;
    
    // Add second layer for wood products if selected (with discount)
    if (state.productType === 'wood' && state.twoLayers) {
        const secondLayerPrice = basePrice * (1 - PRICING.secondLayerDiscount);
        basePrice += secondLayerPrice;
    }
    
    return basePrice;
}

function calculateFramePrice() {
    if (!state.withFrame) return 0;
    
    const framePricing = PRICING.frame;
    
    // Use same dimensions as the product
    const pricing = PRICING[state.productType];
    const adjustedLength = ceilToPricingUnit(state.length, pricing.unitSize);
    const adjustedWidth = ceilToPricingUnit(state.width, pricing.unitSize);
    
    // Calculate units (only the perimeter)
    const unitsLength = adjustedLength / framePricing.unitSize;
    const unitsWidth = adjustedWidth / framePricing.unitSize;
    
    // Calculate perimeter units and price (2 * length + 2 * width)
    const totalUnits = 2 * unitsLength + 2 * unitsWidth;
    return totalUnits * framePricing.unitPrice;
}

function calculateAccessoriesPrice() {
    return state.accessories.reduce((total, accessory) => {
        return total + accessory.price;
    }, 0);
}

function updateTotalPrice() {
    const basePrice = calculateBasePrice();
    const framePrice = calculateFramePrice();
    const accessoriesPrice = calculateAccessoriesPrice();
    
    let totalPrice = basePrice + framePrice + accessoriesPrice;
    
    // Apply 4.3ml thickness markup (35%) if selected and product type is wood
    if (state.productType === 'wood' && state.thickness43ml) {
        totalPrice += totalPrice * 0.35;
    }
    
    // Apply shop markup based on total price
    if (state.forShop) {
        if (totalPrice < 100) {
            totalPrice += totalPrice * 0.40; // 40% markup for prices < 100
        } else if (totalPrice <= 200) {
            totalPrice += totalPrice * 0.25; // 25% markup for prices between 100 and 200
        } else {
            totalPrice += totalPrice * 0.20; // 20% markup for prices > 200
        }
    }
    
    state.totalPrice = totalPrice;
    elements.totalPrice.textContent = state.totalPrice.toFixed(0);
}

function updateProductTypeVisibility() {
    // Show/hide wood-only options based on product type
    const mainCard = document.querySelector('.main-card');
    if (state.productType === 'wood') {
        mainCard.classList.add('wood-type-selected');
    } else {
        mainCard.classList.remove('wood-type-selected');
        // If switching from wood to acrylic, disable wood-only options
        if (state.twoLayers) {
            state.twoLayers = false;
            elements.twoLayers.checked = false;
        }
        if (state.thickness43ml) {
            state.thickness43ml = false;
            elements.thickness43ml.checked = false;
        }
    }
}

function updateSelectedAccessories() {
    // Clear existing items
    elements.selectedAccessories.innerHTML = '';
    
    // If no accessories, no frame, no two layers, no thickness43ml, and no forShop, add a placeholder message
    if (state.accessories.length === 0 && !state.withFrame && 
        !(state.productType === 'wood' && state.twoLayers) && 
        !(state.productType === 'wood' && state.thickness43ml) && 
        !state.forShop) {
        const placeholder = document.createElement('div');
        placeholder.className = 'text-muted text-center p-3';
        placeholder.textContent = 'لم يتم إضافة أي إضافات بعد';
        elements.selectedAccessories.appendChild(placeholder);
        return;
    }
    
    // Add frame if selected
    if (state.withFrame) {
        const frameItem = document.createElement('div');
        frameItem.className = 'selected-item';
        frameItem.innerHTML = `
            <span>إطار</span>
            <span>${calculateFramePrice().toFixed(0)} جنيه</span>
        `;
        elements.selectedAccessories.appendChild(frameItem);
    }
    
    // Add two layers if selected (wood only)
    if (state.productType === 'wood' && state.twoLayers) {
        const basePrice = calculateBasePrice();
        const singleLayerPrice = basePrice / (1 + (1 - PRICING.secondLayerDiscount));
        const secondLayerPrice = singleLayerPrice * (1 - PRICING.secondLayerDiscount);
        
        const layersItem = document.createElement('div');
        layersItem.className = 'selected-item';
        layersItem.innerHTML = `
            <span> طبقة ثانية</span>
            <span>${secondLayerPrice.toFixed(0)} جنيه</span>
        `;
        elements.selectedAccessories.appendChild(layersItem);
    }
    
    // Add 4.3ml thickness if selected (wood only)
    if (state.productType === 'wood' && state.thickness43ml) {
        const basePrice = calculateBasePrice();
        const framePrice = calculateFramePrice();
        const accessoriesPrice = calculateAccessoriesPrice();
        const subtotal = basePrice + framePrice + accessoriesPrice;
        const thicknessPrice = subtotal * 0.35;
        
        const thicknessItem = document.createElement('div');
        thicknessItem.className = 'selected-item';
        thicknessItem.innerHTML = `
            <span>سماكة 4.3 مل </span>
            <span>${thicknessPrice.toFixed(0)} جنيه</span>
        `;
        elements.selectedAccessories.appendChild(thicknessItem);
    }
    
    // Add shop markup if selected
    if (state.forShop) {
        const basePrice = calculateBasePrice();
        const framePrice = calculateFramePrice();
        const accessoriesPrice = calculateAccessoriesPrice();
        let subtotal = basePrice + framePrice + accessoriesPrice;
        
        // Apply 4.3ml thickness markup first if applicable
        if (state.productType === 'wood' && state.thickness43ml) {
            subtotal += subtotal * 0.35;
        }
        
        let markupPercentage;
        if (subtotal < 100) {
            markupPercentage = 0.40; // 40% markup for prices < 100
        } else if (subtotal <= 200) {
            markupPercentage = 0.25; // 25% markup for prices between 100 and 200
        } else {
            markupPercentage = 0.20; // 20% markup for prices > 200
        }
        const markupPrice = subtotal * markupPercentage;
        
        const shopItem = document.createElement('div');
        shopItem.className = 'selected-item';
        shopItem.innerHTML = `
            <span>للمحل ${markupPercentage * 100}٪)</span>
            <span>${markupPrice.toFixed(0)} جنيه</span>
        `;
        elements.selectedAccessories.appendChild(shopItem);
    }
    
    // Add all accessories
    state.accessories.forEach((accessory, index) => {
        const item = document.createElement('div');
        item.className = 'selected-item';
        item.innerHTML = `
            <span>${accessory.name}</span>
            <div>
                <span>${accessory.price} جنيه</span>
                <i class="fas fa-times-circle delete-item" data-index="${index}"></i>
            </div>
        `;
        elements.selectedAccessories.appendChild(item);
        
        // Add event listener to delete button
        const deleteBtn = item.querySelector('.delete-item');
        deleteBtn.addEventListener('click', () => {
            state.accessories.splice(index, 1);
            updateSelectedAccessories();
            updateTotalPrice();
        });
    });
}

// Event listeners
function setupEventListeners() {
    // Product type change
    elements.productType.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.productType = e.target.value;
            updateProductTypeVisibility();
            updateSelectedAccessories();
            updateTotalPrice();
        });
    });
    
    // Length and width change
    elements.length.addEventListener('input', (e) => {
        state.length = parseFloat(e.target.value) || 0;
        updateSelectedAccessories();
        updateTotalPrice();
    });
    
    elements.width.addEventListener('input', (e) => {
        state.width = parseFloat(e.target.value) || 0;
        updateSelectedAccessories();
        updateTotalPrice();
    });
    
    // Frame checkbox
    elements.withFrame.addEventListener('change', (e) => {
        state.withFrame = e.target.checked;
        updateSelectedAccessories();
        updateTotalPrice();
    });
    
    // Two layers checkbox (wood only)
    elements.twoLayers.addEventListener('change', (e) => {
        state.twoLayers = e.target.checked;
        updateSelectedAccessories();
        updateTotalPrice();
    });
    
    // Thickness 4.3ml checkbox (wood only)
    elements.thickness43ml.addEventListener('change', (e) => {
        state.thickness43ml = e.target.checked;
        updateSelectedAccessories();
        updateTotalPrice();
    });
    
    // For shop checkbox
    elements.forShop.addEventListener('change', (e) => {
        state.forShop = e.target.checked;
        updateSelectedAccessories();
        updateTotalPrice();
    });
    
    // Accessory selection
    elements.accessorySelect.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        if (!selectedValue) return;
        
        const accessoryData = PRICING.accessories[selectedValue];
        state.accessories.push({
            id: selectedValue,
            name: accessoryData.name,
            price: accessoryData.price
        });
        
        // Reset select to default option
        e.target.selectedIndex = 0;
        
        updateSelectedAccessories();
        updateTotalPrice();
    });
}

// Initialize the app
function init() {
    setupEventListeners();
    updateProductTypeVisibility();
    updateSelectedAccessories();
    updateTotalPrice();
}

// Start the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);