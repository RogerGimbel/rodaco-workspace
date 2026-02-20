import{c as n,r as u,j as t,B as d,e as p,i as x}from"./index-DeB3MFIT.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=n("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);function y({value:o,label:e,className:c}){const[s,r]=u.useState(!1),a=i=>{i.stopPropagation(),navigator.clipboard.writeText(o).then(()=>{r(!0),x.success(e?`Copied "${e}"`:"Copied to clipboard"),setTimeout(()=>r(!1),2e3)})};return t.jsx("button",{onClick:a,className:p("inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors","text-muted-foreground hover:text-foreground hover:bg-muted/70",s&&"text-success hover:text-success",c),"aria-label":`Copy ${e||o}`,children:s?t.jsx(d,{className:"w-3.5 h-3.5"}):t.jsx(h,{className:"w-3.5 h-3.5"})})}export{y as C};
