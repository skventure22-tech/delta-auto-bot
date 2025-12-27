export const position_size = (w)=>Math.min(w*0.005,0.01).toFixed(4);
export const choose_leverage = (w,m)=> (w<1000||m<500?50:(m>2000?100:50));
export const compute_pnl = (e,n,z,s)=>((s=="BUY"?(n-e)*z:(e-n)*z)).toFixed(2);
export const trail = (p)=> (p>=300&&p<600?"ACTIVE":"-");
