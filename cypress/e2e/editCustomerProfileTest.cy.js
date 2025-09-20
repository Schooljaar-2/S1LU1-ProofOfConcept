/// <reference types="cypress" />

describe('Login with test account', () => {
  it('logs in with env credentials', () => {
    const email = Cypress.env('test_email');
    const password = Cypress.env('test_password');

    cy.visit('/login');
    cy.get('#email').clear().type(email);
    cy.get('#password').clear().type(password);
    cy.get('form').submit();
  });
});

describe('Customer profile navigation', () => {
  before(() => {
    cy.loginAsCustomer();
  });

  it('navigates to customer page and clicks Edit', () => {
    cy.visit('/customer');
    cy.contains('a.btn.btn-warning.btn-lg', 'Edit').click();
    cy.url().should('match', /\/customer\/updateProfile\//);
  });
});

describe('Edit profile and update with random value', () => {
  before(() => {
    cy.loginAsCustomer();
  });

  it('edits first name with a new random string and submits', () => {
    cy.visit('/customer');
    cy.contains('a.btn.btn-warning.btn-lg', 'Edit').click();

    // Generate a random value and ensure it's different from current
    const rand = `Auto${Date.now()}${Math.floor(Math.random()*1000)}`;

    cy.get('#firstName').invoke('val').then((prev) => {
      const prevVal = String(prev || '');
      const newVal = (prevVal === rand) ? `${rand}X` : rand;
      cy.get('#firstName').clear().type(newVal);
      cy.contains('button.btn.btn-warning.btn-lg', 'Update Profile').click();

      cy.url().should('include', '/customer');
      cy.get('.col-md-4').find('h4.mb-1').should('contain', newVal).and('not.contain', prevVal);
    });
  });
});

describe('Logout flow', () => {
  before(() => {
    cy.loginAsCustomer();
  });

  it('logs out and verifies session is cleared', () => {
    cy.visit('/customer');
    cy.contains('a.btn.btn-danger.btn-lg', 'Logout').click();

    // Expect redirect to home (/) and no access to /customer without login
    cy.url().should('match', /\/$/);

    // Visiting /customer should redirect to login or block access when not logged in
    cy.visit('/customer');
    cy.url().should('match', /\/login|\/$/);
  });
});

