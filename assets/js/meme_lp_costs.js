// 4000-LP format: halve fixed activation/attack LP costs, never damage or healing.
(() => {
 const fixed=tcg=>{if(!Number.isFinite(tcg)||tcg<0)throw Error('Invalid LP cost');return Math.ceil(tcg/2);};
 const state=owner=>typeof owner==='string'?side(owner):owner;
 const canPay=(owner,tcg)=>{const s=state(owner);return !!s&&s.lp>fixed(tcg);};
 function pay(owner,tcg,sourceId=null){const s=state(owner),amount=fixed(tcg);if(!canPay(s,tcg))return false;s.lp-=amount;if(typeof duel!=='undefined'&&duel){duel.lpCostLog=[...(duel.lpCostLog||[]),{owner:typeof owner==='string'?owner:null,sourceId,tcgAmount:tcg,paid:amount,round:duel.round}].slice(-32);}return true;}
 // The reserve in a variable cost is a printed condition, not a fixed payment.
 function payToRemaining(owner,reserve,sourceId=null){const s=state(owner);if(!s||!Number.isFinite(reserve)||reserve<=0||s.lp<=reserve)return false;const amount=s.lp-reserve;s.lp=reserve;if(typeof duel!=='undefined'&&duel)duel.lpCostLog=[...(duel.lpCostLog||[]),{owner:typeof owner==='string'?owner:null,sourceId,paid:amount,remaining:reserve,round:duel.round}].slice(-32);return amount;}
 window.memeLpCosts=Object.freeze({fixed,canPay,pay,payToRemaining,formatLp:4000,tcgBaselineLp:8000});
})();
