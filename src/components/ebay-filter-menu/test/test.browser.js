const { expect, use } = require('chai');
const { render, fireEvent, cleanup } = require('@marko/testing-library');
const flat = require('core-js-pure/features/array/flat');
const { pressKey } = require('../../../common/test-utils/browser');
const template = require('..');
const mock = require('./mock');

use(require('chai-dom'));
afterEach(cleanup);

/** @type import("@marko/testing-library").RenderResult */
let component;

describe('given the menu is in the default state', () => {
    const input = mock.Basic_2Items;
    const firstItemText = input.items[0].renderBody.text;
    let footerButton, firstItem, secondItem;

    beforeEach(async() => {
        component = await render(template, input);
        footerButton = component.getAllByRole('button')[0];
        firstItem = component.getAllByRole('menuitemcheckbox')[0];
        secondItem = component.getAllByRole('menuitemcheckbox')[1];
    });

    describe('when an item is clicked', () => {
        beforeEach(async() => {
            await fireEvent.click(component.getByText(firstItemText));
        });

        it('then it emits the filter-menu-change event with correct data', () => {
            const selectEvents = component.emitted('filter-menu-change');
            expect(selectEvents).to.length(1);

            const [[eventArg]] = selectEvents;
            expect(eventArg).has.property('el').with.text(firstItemText);
            expect(eventArg).has.property('checked').to.deep.equal(['item 0']);
        });
    });

    describe('when two items are clicked', () => {
        beforeEach(async() => {
            await fireEvent.click(firstItem);
            await fireEvent.click(secondItem);
        });

        it('then it emits two menu-change events with correct data', () => {
            const changeEvents = component.emitted('filter-menu-change');
            expect(changeEvents).to.have.length(2);

            const [firstEventData, secondEventData] = flat(changeEvents);
            expect(firstEventData).has.property('el', firstItem);
            expect(secondEventData).has.property('el', secondItem);
        });

        it('then both items are selected', () => {
            expect(firstItem).to.have.attr('aria-checked', 'true');
            expect(secondItem).to.have.attr('aria-checked', 'true');
        });
    });

    describe('when an item is checked and then unchecked', () => {
        beforeEach(async() => {
            await fireEvent.click(firstItem);
            await fireEvent.click(firstItem);
        });

        it('then it emits the filter-menu-change events with correct data', () => {
            const changeEvents = component.emitted('filter-menu-change');
            expect(changeEvents).to.have.length(2);

            const [firstEventData, secondEventData] = flat(changeEvents);
            expect(firstEventData).has.property('checked').to.deep.equal(['item 0']);
            expect(secondEventData).has.property('checked').to.deep.equal([]);
        });

        it('then the item is unchecked', () => {
            expect(firstItem).to.have.attr('aria-checked', 'false');
        });
    });

    describe('when an item is checked via the keyboard', () => {
        beforeEach(async() => {
            await pressKey(firstItem, {
                key: '(Space character)',
                keyCode: 32
            });
        });

        it('then it emits the filter-menu-change events with correct data', () => {
            const changeEvents = component.emitted('filter-menu-change');
            expect(changeEvents).to.have.length(1);

            const [firstEventData] = flat(changeEvents);
            expect(firstEventData).has.property('el').with.text(firstItemText);
            expect(firstEventData).has.property('checked').to.deep.equal(['item 0']);
        });
    });

    describe('when the footer button is clicked', () => {
        beforeEach(async() => {
            await fireEvent.click(footerButton);
        });

        it('then it emits the filter-menu-footer-click event', () => {
            const changeEvents = component.emitted('filter-menu-footer-click');
            expect(changeEvents).to.have.length(1);
        });
    });

    describe('when an item is added via input from its parent and the new item is clicked', () => {
        const newInput = mock.Basic_3Items;
        const thirdItemText = newInput.items[2].renderBody.text;
        beforeEach(async() => {
            await component.rerender(newInput);
            await fireEvent.click(component.getByText(thirdItemText));
        });

        it('then it uses the new input in event data', () => {
            const selectEvents = component.emitted('filter-menu-change');
            expect(selectEvents).has.length(1);

            const [[eventArg]] = selectEvents;
            expect(eventArg).has.property('checked').to.deep.equal(['item 2']);
        });
    });
});
