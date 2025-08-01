/**
 * This file contains some integration with the native Shopify Reviews app to style it in the context of the theme.
 */

import {Delegate} from "//f101d2-3.myshopify.com/cdn/shop/t/2/assets/vendor.min.js?v=56430842210900357591692287010";

const _transformForm = (spr) => {
  const labels = Array.from(spr.querySelectorAll('.spr-form-label')),
    buttons = Array.from(spr.querySelectorAll('.spr-form-actions .spr-button'));

  spr.querySelector('.spr-form-contact')?.classList.add('input-row');
  spr.querySelector('.spr-form-review')?.classList.add('fieldset');

  labels.forEach(label => {
    if (label.control) {
      label.className = 'floating-label';
      label.control.placeholder = ' ';

      if (label.control.tagName === 'INPUT') {
        label.control.className = 'input is-floating';
      } else if (label.control.tagName === 'TEXTAREA') {
        label.control.className = 'textarea is-floating';
        label.control.rows = 5;
      }

      label.control.insertAdjacentElement('afterend', label);
    }
  });

  buttons.forEach(button => {
    button.classList.add('button', 'button--primary', 'button--xl'); // Replace button class
  });
}

window.SPRCallbacks = {
  onProductLoad: (event, params) => {
    const spr = document.querySelector(`#shopify-product-reviews[data-id="${params.id}"]`),
      section = spr.closest('.shopify-section--apps');

    if (!section) {
      return;
    }

    // If we are in the context of the "Apps" section, we add our custom block
    const headerTemplate = section.querySelector('#shopify-reviews-custom-header');

    if (!headerTemplate) {
      return;
    }

    spr.classList.add('custom-spr');
    spr.prepend(headerTemplate.content.cloneNode(true));
  },

  onReviewsLoad: (event, params) => {
    const spr = document.querySelector(`#shopify-product-reviews[data-id="${params.id}"]`);

    // If we have no review, we toggle the form by default
    const reviewsContainer = spr.querySelector('.spr-reviews');

    if (reviewsContainer.childElementCount === 0) {
      spr.querySelector('.spr-form').style.display = 'block';
    }
  },

  onFormLoad: (event, params) => {
    _transformForm(document.querySelector(`#shopify-product-reviews[data-id="${params.id}"]`));
  },

  onFormSuccess: (event, params) => {
    const spr = document.querySelector(`#shopify-product-reviews[data-id="${params.id}"]`);

    spr.querySelector('.spr-form-message-success').className = 'spr-form-banner banner banner--success justify-center';
  },

  onFormFailure: (event, params) => {
    const spr = document.querySelector(`#shopify-product-reviews[data-id="${params.id}"]`);

    spr.querySelector('.spr-form-message-error').className = 'spr-form-banner banner banner--error justify-center';
    _transformForm(spr); // On form failure SPR re-renders the whole form, so we have to process the fields again
  }
}

class CustomSprHeader extends HTMLElement {
  constructor() {
    super();

    this._delegate = new Delegate(this);
    this._delegate.on('click', 'button', this._toggleForm.bind(this));
  }

  _toggleForm() {
    if (parseInt(this.getAttribute('review-count')) === 0) {
      return; /* We never want to hide the form when no review */
    }

    SPR.toggleForm(this.getAttribute('product-id'));
  }
}

if (!window.customElements.get('custom-spr-header')) {
  window.customElements.define('custom-spr-header', CustomSprHeader);
}