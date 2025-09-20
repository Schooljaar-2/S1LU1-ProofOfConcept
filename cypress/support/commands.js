// ***********************************************
// Custom Cypress commands
// ***********************************************

// Programmatic login that caches the session across tests/specs
// Requires test_email and test_password set in Cypress env
Cypress.Commands.add('loginAsCustomer', () => {
	const email = Cypress.env('test_email');
	const password = Cypress.env('test_password');

	if (!email || !password) {
		throw new Error('Missing Cypress env: test_email and/or test_password');
	}

	cy.session(['customer', email], () => {
		cy.request({
			method: 'POST',
			url: '/login',
			form: true,
			body: { email, password },
			followRedirect: false,
		}).its('status').should('be.oneOf', [200, 302]);
	}, { cacheAcrossSpecs: true });
});