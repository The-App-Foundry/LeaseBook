import{j as c}from"./iframe-DnqJuSJ7.js";import{D as u}from"./Dropdown-axw9sp4S.js";import{c as l}from"./createLucideIcon-CZNb5f2f.js";import"./preload-helper-PPVm8Dsz.js";const h=[["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M12 6h.01",key:"1vi96p"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M16 6h.01",key:"1x0f13"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M8 6h.01",key:"1dz90k"}],["path",{d:"M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",key:"cabbwy"}],["rect",{x:"4",y:"2",width:"16",height:"20",rx:"2",key:"1uxh74"}]],y=l("building",h);const g=[["path",{d:"M12 16h.01",key:"1drbdi"}],["path",{d:"M16 16h.01",key:"1f9h7w"}],["path",{d:"M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z",key:"1iv0i2"}],["path",{d:"M8 16h.01",key:"18s6g9"}]],b=l("factory",g);const w=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]],v=l("house",w),{userEvent:k,within:A,expect:t}=__STORYBOOK_MODULE_TEST__,S={title:"UI/Dropdown",component:u,tags:["autodocs"],argTypes:{buttonLabel:{control:"text",description:"Label text for the dropdown trigger button"},items:{description:"Array of menu items with title, optional icon, and optional action"}},parameters:{docs:{description:{component:"A dropdown menu component with smart positioning that flips above/below based on viewport space."}}}},e={args:{buttonLabel:"Options",items:[{title:"Option 1"},{title:"Option 2"},{title:"Option 3"}]}},n={args:{buttonLabel:"Select Type",items:[{title:"Residential",icon:c.jsx(v,{size:16})},{title:"Commercial",icon:c.jsx(y,{size:16})},{title:"Industrial",icon:c.jsx(b,{size:16})}]}},a={args:{buttonLabel:"Sort by",items:[{title:"Expiration"},{title:"Address"},{title:"Type"}]},parameters:{docs:{description:{story:"Example from FilterBar showing sort options"}}}},o={args:{buttonLabel:"Select State",items:[{title:"Alabama"},{title:"Alaska"},{title:"Arizona"},{title:"Arkansas"},{title:"California"},{title:"Colorado"},{title:"Connecticut"},{title:"Delaware"},{title:"Florida"},{title:"Georgia"}]},parameters:{docs:{description:{story:"Dropdown with many items shows scrolling behavior"}}}},i={args:{buttonLabel:"Actions",items:[{title:"Edit"},{title:"Delete"},{title:"Archive"}]},play:async({canvasElement:p})=>{const s=A(p),r=s.getByRole("button",{name:/Actions/i});await t(r).toHaveAttribute("aria-expanded","false"),await k.click(r),await t(r).toHaveAttribute("aria-expanded","true");const d=s.getByRole("menu");await t(d).toBeInTheDocument();const m=s.getAllByRole("menuitem");await t(m).toHaveLength(3)},parameters:{docs:{description:{story:"Demonstrates dropdown interaction - click to open/close, escape to close"}}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    buttonLabel: 'Options',
    items: [{
      title: 'Option 1'
    }, {
      title: 'Option 2'
    }, {
      title: 'Option 3'
    }]
  }
}`,...e.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    buttonLabel: 'Select Type',
    items: [{
      title: 'Residential',
      icon: <Home size={16} />
    }, {
      title: 'Commercial',
      icon: <Building size={16} />
    }, {
      title: 'Industrial',
      icon: <Factory size={16} />
    }]
  }
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    buttonLabel: 'Sort by',
    items: [{
      title: 'Expiration'
    }, {
      title: 'Address'
    }, {
      title: 'Type'
    }]
  },
  parameters: {
    docs: {
      description: {
        story: 'Example from FilterBar showing sort options'
      }
    }
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    buttonLabel: 'Select State',
    items: [{
      title: 'Alabama'
    }, {
      title: 'Alaska'
    }, {
      title: 'Arizona'
    }, {
      title: 'Arkansas'
    }, {
      title: 'California'
    }, {
      title: 'Colorado'
    }, {
      title: 'Connecticut'
    }, {
      title: 'Delaware'
    }, {
      title: 'Florida'
    }, {
      title: 'Georgia'
    }]
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with many items shows scrolling behavior'
      }
    }
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    buttonLabel: 'Actions',
    items: [{
      title: 'Edit'
    }, {
      title: 'Delete'
    }, {
      title: 'Archive'
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: /Actions/i
    });

    // Initially closed
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Menu should be visible
    const menu = canvas.getByRole('menu');
    await expect(menu).toBeInTheDocument();

    // Should have 3 menu items
    const menuItems = canvas.getAllByRole('menuitem');
    await expect(menuItems).toHaveLength(3);
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates dropdown interaction - click to open/close, escape to close'
      }
    }
  }
}`,...i.parameters?.docs?.source}}};const L=["Default","WithIcons","SortByDropdown","ManyItems","WithInteractionTest"];export{e as Default,o as ManyItems,a as SortByDropdown,n as WithIcons,i as WithInteractionTest,L as __namedExportsOrder,S as default};
