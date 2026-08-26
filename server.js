import "dotenv/config";
import express from "express";
import helmet from "helmet";
import crypto from "node:crypto";

const app=express();
const port=Number(process.env.PORT||3000);
const base=(process.env.PAYRUPEE_BASE_URL||"https://payrupee.tech/v1").replace(/\/$/,"");
const min=Number(process.env.MIN_PAYOUT_INR||2500);

app.use(helmet());
app.use(express.json({limit:"20kb"}));
app.use(express.static("public"));

app.get("/health",(_,res)=>res.json({ok:true}));

app.post("/api/payout",async(req,res)=>{
  try{
    const secret=process.env.PAYRUPEE_CLIENT_SECRET;
    if(!secret || secret.includes("PUT_YOUR")) return res.status(500).json({success:false,error:"Server payout credential is not configured."});

    const {amount,recipient}=req.body;
    const n=Number(amount);
    if(!Number.isFinite(n)||n<min) return res.status(400).json({success:false,error:`Minimum payout is ₹${min}.`});
    if(!recipient?.name||!recipient?.upi_id) return res.status(400).json({success:false,error:"Name and UPI ID are required."});

    const order_id=`ORDER-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const payload={order_id,amount:Number(n.toFixed(2)),currency:"INR",method:"upi",
      recipient:{name:String(recipient.name),upi_id:String(recipient.upi_id)}};

    const r=await fetch(`${base}/payouts/`,{
      method:"POST",
      headers:{"Authorization":`Bearer ${secret}`,"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify(payload)
    });
    const text=await r.text();
    let data; try{data=JSON.parse(text)}catch{data={raw:text}}
    res.status(r.status).json({success:r.ok,order_id,payrupee_status:r.status,data});
  }catch(e){
    console.error(e);
    res.status(502).json({success:false,error:"Could not reach payout provider."});
  }
});

app.listen(port,()=>console.log(`http://localhost:${port}`));
