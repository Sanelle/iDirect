document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const bookingForm = document.getElementById('bookingForm');
  const formSteps = document.querySelectorAll('.form-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  const progressBar = document.querySelector('.progress-bar');
  const nextBtns = document.querySelectorAll('.btn-next');
  const prevBtns = document.querySelectorAll('.btn-prev');
  const submitBtn = document.querySelector('.btn-submit');
  const confirmationModal = document.getElementById('confirmationModal');
  const closeModalBtn = document.querySelector('.btn-close-modal');
  const summaryItems = document.querySelector('.summary-items');
  const subtotalEl = document.getElementById('subtotal');
  const grandTotalEl = document.getElementById('grand-total');
  const orderDetails = document.getElementById('orderDetails');
  const hamburger = document.querySelector('.hamburger');
  const navActions = document.querySelector('.nav-actions');
  
  // Form Data
  let currentStep = 1;
  let orderItems = [];
  const deliveryFee = 150;

  // Initialize
  updateOrderSummary();
  setupEventListeners();

  // Event Listeners Setup
  function setupEventListeners() {
    // Navigation
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Form Navigation
    nextBtns.forEach(btn => {
      btn.addEventListener('click', handleNext);
    });
    
    prevBtns.forEach(btn => {
      btn.addEventListener('click', handlePrev);
    });
    
    // Form Submission
    bookingForm.addEventListener('submit', handleSubmit);
    
    // Modal
    closeModalBtn.addEventListener('click', closeModal);
    
    // iPhone Selection
    const iphoneCards = document.querySelectorAll('.iphone-card');
    iphoneCards.forEach(card => {
      card.addEventListener('click', function() {
        // Only select if clicking on the card, not quantity buttons
        if (!event.target.closest('.qty-btn') && !event.target.closest('input')) {
          this.classList.toggle('selected');
          updateSelectedQuantity(this);
        }
      });
      
      // Quantity buttons
      const minusBtn = card.querySelector('.minus');
      const plusBtn = card.querySelector('.plus');
      const qtyInput = card.querySelector('input');
      
      minusBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (parseInt(qtyInput.value) > 0) {
          qtyInput.value = parseInt(qtyInput.value) - 1;
          updateSelectedQuantity(card);
        }
      });
      
      plusBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (parseInt(qtyInput.value) < parseInt(qtyInput.max)) {
          qtyInput.value = parseInt(qtyInput.value) + 1;
          updateSelectedQuantity(card);
        }
      });
      
      qtyInput.addEventListener('change', function(e) {
        e.stopPropagation();
        if (parseInt(this.value) > parseInt(this.max)) {
          this.value = this.max;
        } else if (parseInt(this.value) < parseInt(this.min)) {
          this.value = this.min;
        }
        updateSelectedQuantity(card);
      });
    });
    
    // Accessories Selection
    const accessoryOptions = document.querySelectorAll('.accessory-option input');
    accessoryOptions.forEach(option => {
      option.addEventListener('change', updateOrderSummary);
    });
    
    // Payment Method Selection
    const paymentOptions = document.querySelectorAll('.payment-option input');
    paymentOptions.forEach(option => {
      option.addEventListener('change', function() {
        document.querySelectorAll('.payment-card').forEach(card => {
          card.classList.remove('active');
        });
        if (this.checked) {
          this.closest('.payment-option').querySelector('.payment-card').classList.add('active');
        }
      });
    });
  }

  // Form Navigation Functions
  function handleNext() {
    if (!validateStep(currentStep)) return;
    
    // Hide current step
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');
    
    // Show next step
    currentStep++;
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
    document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');
    
    // Update progress bar
    updateProgressBar();
    
    // Scroll to top of form
    bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handlePrev() {
    // Hide current step
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');
    
    // Show previous step
    currentStep--;
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
    document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');
    
    // Update progress bar
    updateProgressBar();
  }

  function validateStep(step) {
    let isValid = true;
    
    if (step === 1) {
      const inputs = document.querySelectorAll('.form-step[data-step="1"] input, .form-step[data-step="1"] textarea');
      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.parentElement.classList.add('error');
          isValid = false;
        } else {
          input.parentElement.classList.remove('error');
        }
      });
    }
    
    if (step === 2) {
      const selectedItems = document.querySelectorAll('.iphone-card.selected');
      if (selectedItems.length === 0) {
        alert('Please select at least one iPhone model');
        isValid = false;
      }
    }
    
    return isValid;
  }

  function updateProgressBar() {
    const progressPercentage = (currentStep - 1) / (progressSteps.length - 1) * 100;
    progressBar.style.setProperty('--progress', `${progressPercentage}%`);
  }

  // Order Management Functions
  function updateSelectedQuantity(card) {
    const qtyInput = card.querySelector('input');
    if (card.classList.contains('selected') && parseInt(qtyInput.value) === 0) {
      qtyInput.value = 1;
    } else if (!card.classList.contains('selected')) {
      qtyInput.value = 0;
    }
    updateOrderSummary();
  }

  function updateOrderSummary() {
    // Clear previous items
    summaryItems.innerHTML = '';
    orderItems = [];
    let subtotal = 0;
    
    // Add iPhones to order
    const iphoneCards = document.querySelectorAll('.iphone-card');
    iphoneCards.forEach(card => {
      const quantity = parseInt(card.querySelector('input').value);
      if (quantity > 0) {
        const name = card.querySelector('h3').textContent;
        const price = parseFloat(card.dataset.price);
        const total = price * quantity;
        
        orderItems.push({
          name,
          quantity,
          price,
          total
        });
        
        subtotal += total;
        
        // Add to summary
        const itemEl = document.createElement('div');
        itemEl.className = 'summary-item';
        itemEl.innerHTML = `
          <span>${name} × ${quantity}</span>
          <span>R${total.toLocaleString('en-ZA')}</span>
        `;
        summaryItems.appendChild(itemEl);
      }
    });
    
    // Add accessories to order
    const accessoryOptions = document.querySelectorAll('.accessory-option input:checked');
    accessoryOptions.forEach(option => {
      const label = option.nextElementSibling.textContent.trim();
      const name = label.split(' - ')[0];
      const price = parseFloat(option.dataset.price);
      
      orderItems.push({
        name,
        quantity: 1,
        price,
        total: price
      });
      
      subtotal += price;
      
      // Add to summary
      const itemEl = document.createElement('div');
      itemEl.className = 'summary-item';
      itemEl.innerHTML = `
        <span>${name}</span>
        <span>R${price.toLocaleString('en-ZA')}</span>
      `;
      summaryItems.appendChild(itemEl);
    });
    
    // Update totals
    subtotalEl.textContent = `R${subtotal.toLocaleString('en-ZA')}`;
    const total = subtotal + deliveryFee;
    grandTotalEl.textContent = `R${total.toLocaleString('en-ZA')}`;
  }

  // Form Submission
  function handleSubmit(e) {
    e.preventDefault();
    
    // Validate payment method
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    // Prepare order details for confirmation
    let orderHTML = '';
    orderItems.forEach(item => {
      orderHTML += `
        <div class="order-item">
          <span>${item.name} ${item.quantity > 1 ? `× ${item.quantity}` : ''}</span>
          <span>R${item.total.toLocaleString('en-ZA')}</span>
        </div>
      `;
    });
    
    orderHTML += `
      <div class="order-total">
        <span>Subtotal:</span>
        <span>R${subtotalEl.textContent.replace('R', '')}</span>
      </div>
      <div class="order-total">
        <span>Delivery:</span>
        <span>R${deliveryFee.toLocaleString('en-ZA')}</span>
      </div>
      <div class="order-total grand">
        <span>Total:</span>
        <span>R${grandTotalEl.textContent.replace('R', '')}</span>
      </div>
      <div class="order-payment">
        <strong>Payment Method:</strong> ${paymentMethod.value}
      </div>
    `;
    
    orderDetails.innerHTML = orderHTML;
    
    // Show confirmation modal
    confirmationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset form after submission (optional)
    setTimeout(() => {
      // bookingForm.reset();
      // currentStep = 1;
      // updateProgressBar();
      // document.querySelectorAll('.form-step').forEach(step => {
      //   step.classList.remove('active');
      // });
      // document.querySelector('.form-step[data-step="1"]').classList.add('active');
      // document.querySelectorAll('.progress-step').forEach(step => {
      //   step.classList.remove('active');
      // });
      // document.querySelector('.progress-step[data-step="1"]').classList.add('active');
    }, 3000);
  }

  function closeModal() {
    confirmationModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // Mobile Menu Toggle
  function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navActions.classList.toggle('active');
  }

  // Helper function to format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  }

  // Initialize progress bar CSS variable
  document.documentElement.style.setProperty('--progress', '0%');
});
