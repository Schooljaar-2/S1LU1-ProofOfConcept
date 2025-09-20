/// <reference types="cypress" />

describe('Login page', () => {
  it('should type email into the email field', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('123@hello.nl');
  });
});
