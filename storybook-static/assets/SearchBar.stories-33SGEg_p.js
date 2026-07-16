import{r as u,j as n}from"./iframe-DnqJuSJ7.js";import{S as l}from"./SearchBar-DdF3K3jH.js";import"./preload-helper-PPVm8Dsz.js";import"./createLucideIcon-CZNb5f2f.js";const{fn:i}=__STORYBOOK_MODULE_TEST__,{userEvent:h,within:d,expect:m}=__STORYBOOK_MODULE_TEST__,T={title:"UI/SearchBar",component:l,tags:["autodocs"],argTypes:{value:{control:"text",description:"Current search value"},onChange:{description:"Callback when search value changes"},placeholder:{control:"text",description:"Placeholder text"}},args:{onChange:i()}},r={args:{placeholder:"Search..."}},t={args:{placeholder:"Search properties..."}},s={args:{value:"Sample search query",placeholder:"Search..."}},c={render:function(){const[a,e]=u.useState("");return n.jsxs("div",{children:[n.jsx(l,{value:a,onChange:e,placeholder:"Type to search..."}),n.jsxs("p",{style:{marginTop:"16px"},children:["Current value: ",a||"(empty)"]})]})}},o={render:function(){const[a,e]=u.useState("");return n.jsx(l,{value:a,onChange:e,placeholder:"Search properties..."})},play:async({canvasElement:p})=>{const e=d(p).getByRole("searchbox");await h.type(e,"Test property",{delay:100}),await m(e).toHaveValue("Test property")}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Search...'
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Search properties...'
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'Sample search query',
    placeholder: 'Search...'
  }
}`,...s.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: function InteractiveSearchBar() {
    const [value, setValue] = useState('');
    return <div>
        <SearchBar value={value} onChange={setValue} placeholder="Type to search..." />
        <p style={{
        marginTop: '16px'
      }}>Current value: {value || '(empty)'}</p>
      </div>;
  }
}`,...c.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: function InteractiveForTest() {
    const [value, setValue] = useState('');
    return <SearchBar value={value} onChange={setValue} placeholder="Search properties..." />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole('searchbox');
    await userEvent.type(searchInput, 'Test property', {
      delay: 100
    });
    await expect(searchInput).toHaveValue('Test property');
  }
}`,...o.parameters?.docs?.source}}};const x=["Default","CustomPlaceholder","WithValue","Interactive","WithInteractionTest"];export{t as CustomPlaceholder,r as Default,c as Interactive,o as WithInteractionTest,s as WithValue,x as __namedExportsOrder,T as default};
