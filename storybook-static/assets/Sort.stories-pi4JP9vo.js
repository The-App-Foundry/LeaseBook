import{j as s}from"./iframe-DnqJuSJ7.js";import{S as i}from"./Sort-CISvqdw4.js";import"./preload-helper-PPVm8Dsz.js";import"./createLucideIcon-CZNb5f2f.js";const{userEvent:r,within:d,expect:o}=__STORYBOOK_MODULE_TEST__,w={title:"UI/Sort",component:i,tags:["autodocs"],parameters:{docs:{description:{component:"A stateful toggle button for sorting controls. Alternates between ascending and descending sort orders with visual icon feedback."}}}},e={parameters:{docs:{description:{story:"Default state shows ascending sort icon (ArrowDownUp)"}}}},n={play:async({canvasElement:c})=>{const t=d(c).getByRole("button");await o(t).toHaveAttribute("aria-label","Sort: ascending"),await r.click(t),await o(t).toHaveAttribute("aria-label","Sort: descending"),await r.click(t),await o(t).toHaveAttribute("aria-label","Sort: ascending")},parameters:{docs:{description:{story:"Demonstrates the toggle interaction - click to switch between ascending and descending states."}}}},a={render:()=>s.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[s.jsx("span",{style:{fontSize:"14px"},children:"Sort:"}),s.jsx(i,{})]}),parameters:{docs:{description:{story:"Example of Sort component in context with a label, as used in FilterBar"}}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Default state shows ascending sort icon (ArrowDownUp)'
      }
    }
  }
}`,...e.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const sortButton = canvas.getByRole('button');

    // Initial state should be ascending
    await expect(sortButton).toHaveAttribute('aria-label', 'Sort: ascending');

    // Click to toggle to descending
    await userEvent.click(sortButton);
    await expect(sortButton).toHaveAttribute('aria-label', 'Sort: descending');

    // Click again to toggle back to ascending
    await userEvent.click(sortButton);
    await expect(sortButton).toHaveAttribute('aria-label', 'Sort: ascending');
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the toggle interaction - click to switch between ascending and descending states.'
      }
    }
  }
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}>
      <span style={{
      fontSize: '14px'
    }}>Sort:</span>
      <Sort />
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Example of Sort component in context with a label, as used in FilterBar'
      }
    }
  }
}`,...a.parameters?.docs?.source}}};const b=["Default","WithInteractionTest","InContext"];export{e as Default,a as InContext,n as WithInteractionTest,b as __namedExportsOrder,w as default};
