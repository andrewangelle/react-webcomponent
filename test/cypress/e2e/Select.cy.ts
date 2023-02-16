describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/')

    const selectElement = cy.get('select-test');
    selectElement.should('be.visible');

    const getToggleButton = () => selectElement.get('button');

    getToggleButton().click();

    const option1 = cy.contains('Option 1');
    option1.click();

    getToggleButton().should('have.text', 'Option 1')

    getToggleButton().click();

    const option2 = cy.contains('Option 2');
    option2.click();

    getToggleButton().should('have.text', 'Option 2')
  })
})