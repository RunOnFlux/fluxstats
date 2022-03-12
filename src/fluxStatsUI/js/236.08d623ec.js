"use strict";(self["webpackChunkfluxstats"]=self["webpackChunkfluxstats"]||[]).push([[236],{9685:function(t,e,a){a.r(e),a.d(e,{default:function(){return C}});var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"row"},[t._m(0),a("p",{staticClass:"category"}),a("div",[a("loading",{attrs:{active:t.isLoading,"can-cancel":!0},on:{"update:active":function(e){t.isLoading=e}}})],1),a("div",{staticClass:"col-12"},[a("card",[a("div",[a("div",{staticClass:"col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"},[a("el-select",{staticClass:"select-default mb-3",staticStyle:{width:"200px"},attrs:{placeholder:"Per page"},model:{value:t.pagination.perPage,callback:function(e){t.$set(t.pagination,"perPage",e)},expression:"pagination.perPage"}},t._l(t.pagination.perPageOptions,(function(t){return a("el-option",{key:t,staticClass:"select-default",attrs:{label:t,value:t}})})),1),a("el-input",{staticClass:"mb-3",staticStyle:{width:"200px"},attrs:{type:"search",placeholder:"Search IP","aria-controls":"datatables"},model:{value:t.searchQuery,callback:function(e){t.searchQuery=e},expression:"searchQuery"}})],1),a("div",{staticClass:"col-sm-12"},[a("el-table",{staticStyle:{width:"100%"},attrs:{stripe:"",data:t.queriedData,border:""}},[a("el-table-column",{attrs:{type:"expand"},scopedSlots:t._u([{key:"default",fn:function(e){return[a("p",[a("b",[t._v("Collateral:")]),t._v(" "+t._s(e.row.node.status.collateral)+" ")]),a("p",[a("b",[t._v("Txn Hash:")]),t._v(" "+t._s(e.row.node.status.txhash))]),a("p",[a("b",[t._v("Added Height:")]),t._v(" "+t._s(e.row.node.status.added_height))]),a("p",[a("b",[t._v("Confirmed Height:")]),t._v(" "+t._s(e.row.node.status.confirmed_height))]),a("p",[a("b",[t._v("Last Confirmed Height:")]),t._v(" "+t._s(e.row.node.status.last_confirmed_height))]),a("p",[a("b",[t._v("Last Paid Height:")]),t._v(" "+t._s(e.row.node.status.last_paid_height))]),a("p",[a("b",[t._v("Payment Address:")]),t._v(" "+t._s(e.row.node.status.payment_address))]),a("p",[a("b",[t._v("Active Since:")]),t._v(" "+t._s(e.row.node.status.activesince))]),a("p",[a("b",[t._v("Active Since Converted:")]),t._v(" "+t._s(new Date(parseInt(1e3*e.row.node.status.activesince)).toLocaleDateString())+" "+t._s(new Date(parseInt(1e3*e.row.node.status.activesince)).toLocaleTimeString()))]),a("p",[a("b",[t._v("Last Paid:")]),t._v(" "+t._s(e.row.node.status.lastpaid))]),a("p",[a("b",[t._v("Last Paid Converted:")]),t._v(" "+t._s(new Date(parseInt(1e3*e.row.node.status.lastpaid)).toLocaleDateString())+" "+t._s(new Date(parseInt(1e3*e.row.node.status.lastpaid)).toLocaleTimeString()))]),a("p",[a("b",[t._v("Amount:")]),t._v(" "+t._s(e.row.node.status.amount))])]}}])}),t._l(t.tableColumns,(function(t){return a("el-table-column",{key:t.label,attrs:{"min-width":t.minWidth,prop:t.prop,label:t.label}})}))],2)],1)]),a("div",{staticClass:"col-12 d-flex justify-content-center justify-content-sm-between flex-wrap",attrs:{slot:"footer"},slot:"footer"},[a("div",{},[a("p",{staticClass:"card-category"},[t._v("Showing "+t._s(t.from+1)+" to "+t._s(t.to)+" of "+t._s(t.total)+" entries")])]),a("l-pagination",{staticClass:"pagination-no-border",attrs:{"per-page":t.pagination.perPage,total:t.pagination.total},model:{value:t.pagination.currentPage,callback:function(e){t.$set(t.pagination,"currentPage",e)},expression:"pagination.currentPage"}})],1)])],1)])},n=[function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"col-md-12"},[a("h2",{staticClass:"title"},[t._v("Node")])])}],i=a(5034),o=a.n(i),r=a(3364),l=a.n(r),c=a(5614),d=a.n(c),p=a(7186),u=a.n(p),h=a(6160),g=a(4221),_=a(9669),v=a.n(_),f=a(7398),b=a.n(f),m={components:{LPagination:h.tl,[u().name]:u(),[d().name]:d(),[l().name]:l(),[o().name]:o(),Loading:b()},data(){return{pagination:{perPage:5,currentPage:1,perPageOptions:[5,10,25,50],total:0},searchQuery:"",propsToSearch:["node.status.ip"],tableColumns:[{prop:"node.status.ip",label:"IP Address",minWidth:70},{prop:"node.status.network",label:"Network Protocol",minWidth:40},{prop:"node.status.tier",label:"Tier",minWidth:90},{prop:"node.status.status",label:"Status",minWidth:50}],tableData:[],fuseSearch:null,isLoading:!1}},computed:{pagedData(){return this.tableData.slice(this.from,this.to)},queriedData(){let t;if(""!==this.searchQuery){var e=[];t=this.fuseSearch.search(`=${this.searchQuery}`);for(let a=0;a<Object.keys(t).length;a++)e.push(t[a].item);t=e,this.paginationTotal(t.length)}else this.paginationTotal(this.tableData.length),t=this.tableData;return t.slice(this.from,this.to)},to(){let t=this.from+this.pagination.perPage;return this.total<t&&(t=this.total),t},from(){return this.pagination.perPage*(this.pagination.currentPage-1)},total(){return this.paginationTotal(this.tableData.length),this.tableData.length}},methods:{paginationTotal(t){this.pagination.total=t}},mounted(){this.isLoading=!0,v().get("https://stats.runonflux.io/fluxinfo?projection=node").then((t=>{this.tableData=t.data.data,this.fuseSearch=new g.Z(this.tableData,{useExtendedSearch:!0,keys:["node.status.ip"]}),this.isLoading=!1}))}},w=m,y=a(1001),P=(0,y.Z)(w,s,n,!1,null,null,null),C=P.exports}}]);
//# sourceMappingURL=236.08d623ec.js.map