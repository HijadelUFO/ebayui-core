const { expect, use } = require('chai');
const { render } = require('@marko/testing-library');
const { testPassThroughAttributes } = require('../../../common/test-utils/server');
const migrator = require('../migrator');
const { runTransformer } = require('../../../common/test-utils/server');
const template = require('..');
const mock = require('./mock');

use(require('chai-dom'));

describe('tabs', () => {
    it('renders basic version with 3 headings and 3 panels', async() => {
        const input = mock.Basic_3Headings_3Panels_No_Index;
        const { getByRole, getAllByRole } = await render(template, input);

        const tablistEl = getByRole('tablist');
        const headingEls = getAllByRole('tab');
        const panelEls = getAllByRole('tabpanel');

        expect(tablistEl).has.class('tabs__items');
        expect(headingEls).has.length(3);
        expect(panelEls).has.length(3);

        input.headings.forEach((heading, i) => {
            const headingEl = headingEls[i];
            const panelEl = panelEls[i];
            expect(tablistEl).contains(headingEl);
            expect(headingEl).has.class('tabs__item');
            expect(headingEl).has.text(heading.renderBody.text);
            expect(headingEl).has.attr('aria-controls', panelEl.id);

            if (i === 0) {
                expect(headingEl).has.attr('aria-selected', 'true');
            } else {
                expect(headingEl).does.not.have.attr('aria-selected');
            }
        });

        input.panels.forEach((panel, i) => {
            const panelEl = panelEls[i];
            const headingEl = headingEls[i];
            expect(panelEl).has.class('tabs__panel');
            expect(panelEl).has.text(panel.renderBody.text);
            expect(panelEl).has.attr('aria-labelledby', headingEl.id);

            if (i === 0) {
                expect(panelEl).does.not.have.attr('hidden');
            } else {
                expect(panelEl).has.attr('hidden');
            }
        });
    });

    it('renders basic version with 3 headings and 3 panels on the second panel', async() => {
        const input = mock.Basic_3Headings_3Panels_1Index;
        const { getAllByRole } = await render(template, input);

        getAllByRole('tab').forEach((headingEl, i) => {
            if (i === 1) {
                expect(headingEl).has.attr('aria-selected', 'true');
            } else {
                expect(headingEl).does.not.have.attr('aria-selected');
            }
        });

        getAllByRole('tabpanel').forEach((panelEl, i) => {
            if (i === 1) {
                expect(panelEl).does.not.have.attr('hidden');
            } else {
                expect(panelEl).has.attr('hidden');
            }
        });
    });

    it('renders fake version with 3 headings', async() => {
        const input = mock.Fake_3Headings_No_Index;
        const { getByText } = await render(template, input);

        input.headings.forEach((heading, i) => {
            const headingEl = getByText(heading.renderBody.text);
            expect(headingEl).has.property('parentElement').with.class('fake-tabs__item');
            expect(headingEl).has.attr('href', heading.href);

            if (i === 0) {
                expect(headingEl).has.attr('aria-current', 'page');
            } else {
                expect(headingEl).does.not.have.attr('aria-current');
            }
        });

        const [panel] = input.panels;
        const panelEl = getByText(panel.renderBody.text);
        expect(panelEl).has.property('parentElement').with.class('fake-tabs__cell');
    });

    it('renders fake version with 3 headings on the second panel', async() => {
        const input = mock.Fake_3Headings_1Index;
        const { getByText } = await render(template, input);
        input.headings.forEach((heading, i) => {
            const headingEl = getByText(heading.renderBody.text);

            if (i === 1) {
                expect(headingEl).has.attr('aria-current', 'page');
            } else {
                expect(headingEl).does.not.have.attr('aria-current');
            }
        });
    });

    testPassThroughAttributes(template);
});

describe('tabs-heading', () => {
    testPassThroughAttributes(template, {
        child: {
            name: 'headings',
            multiple: true
        }
    });

    describe('when fake', () => {
        testPassThroughAttributes(template, {
            child: {
                name: 'headings',
                multiple: true,
                input: { fake: true }
            }
        });
    });
});

describe('tabs-panel', () => {
    testPassThroughAttributes(template, {
        child: {
            name: 'panels',
            multiple: true
        }
    });

    describe('when fake', () => {
        testPassThroughAttributes(template, {
            child: {
                name: 'panels',
                multiple: true,
                input: { fake: true }
            }
        });
    });
});

describe('migrator', () => {
    const componentPath = '../index.marko';

    it('migrates ebay-tab to ebay-tabs', () => {
        // eslint-disable-next-line max-len
        const tagString = '<ebay-tab><ebay-tab-heading>item</ebay-tab-heading><ebay-tab-panel>item</ebay-tab-panel></ebay-tab>';
        const { el } = runTransformer(migrator, tagString, componentPath);
        const { body: { array: [heading, panel] } } = el;
        expect(el.tagName).to.equal('ebay-tabs');
        expect(heading.tagName).to.equal('ebay-tabs-heading');
        expect(panel.tagName).to.equal('ebay-tabs-panel');
    });

    it('migrates tab-select event to tabs-select', () => {
        // eslint-disable-next-line max-len
        const tagString = '<ebay-tab on-tab-select(() => {})><ebay-tab-heading>item</ebay-tab-heading><ebay-tab-panel>item</ebay-tab-panel></ebay-tab>';
        const { el } = runTransformer(migrator, tagString, componentPath);
        expect(el.tagName).to.equal('ebay-tabs');
        expect(el.hasAttribute('on-tabs-select')).equals(true);
    });

    it('migrates ebay-tabs nested items', () => {
        // eslint-disable-next-line max-len
        const tagString = '<ebay-tabs><ebay-tab-heading>item</ebay-tab-heading><ebay-tab-panel>item</ebay-tab-panel></ebay-tabs>';
        const { el } = runTransformer(migrator, tagString, componentPath);
        const { body: { array: [heading, panel] } } = el;
        expect(el.tagName).to.equal('ebay-tabs');
        expect(heading.tagName).to.equal('ebay-tabs-heading');
        expect(panel.tagName).to.equal('ebay-tabs-panel');
    });

    it('migrates ebay-tabs tab-select event to tabs-select', () => {
        // eslint-disable-next-line max-len
        const tagString = '<ebay-tabs on-tab-select(() => {})><ebay-tab-heading>item</ebay-tab-heading><ebay-tab-panel>item</ebay-tab-panel></ebay-tabs>';
        const { el } = runTransformer(migrator, tagString, componentPath);
        expect(el.tagName).to.equal('ebay-tabs');
        expect(el.hasAttribute('on-tabs-select')).equals(true);
    });
});
