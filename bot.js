import { Bot } from "grammy";
import dotenv from 'dotenv';
import fetch from 'node-fetch'
import { createClient } from "redis";
import QuickChart from "quickchart-js";


//const client = createClient()

const chart = new QuickChart();
chart.setWidth(700);
chart.setHeight(400);

// client.on('error',err=>{console.log("error form redis "+ err)})

// await client.connect()

dotenv.config();



const bot = new Bot(process.env.TELEGRAM_API_KEY);


bot.command("start", ctx=> ctx.reply("Welcome!"));

//help comand
bot.command("help", ctx=>{
  ctx.reply("Usage: /cbe <currency name> e.g /rate USD \n"
    +"Usage: /nbe currency name e.g /nbe usd \n"
   +"Usage: /price <coin name> <currencies> e.g /price bitcoin usd \n" 
   + "Usage: /awash currency name e.g /awash usd \n" 
   + "Usage: /oromia currency name e.g /oromia usd \n"
   + "Usage: /dbh currency name e.g /dbh us \n"
  +  "Usage: /global currency name e.g /global usd");
});


//For crypto price btc,eth 
bot.command("price",async(ctx)=>{
    const str = ctx.message.text.split(" ");
    if(str.length<3){
        return ctx.reply("Usage: /price <coin name> <currencies> e.g /price bitcoin usd")
    }
    
    const coinName = str[1].toLowerCase();
    const currency = str[2].toLowerCase();
    
    try{
        
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinName}/market_chart?vs_currency=${currency}&days=7
`);
    if(!response.ok){
        throw new Error('Error has occured while fetching data');
    }
    const data =  await response.json();
    
    
//     let price = data.prices.map(p=> p[1]);
//     let lables = data.prices.map(p=> {
//         const d = new Date(p[0]);
//         `${d.getMonth()+1}/${d.getDate()}`;
//     })


     chart.setConfig({
  type: "bar",
  data: {
    labels: data.prices.map(p => new Date(p[0])), // timestamps as Date objects
    datasets: [
      {
        type: "line",
        label: `${coinName.toUpperCase()} Price`,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgb(75, 192, 192)",
        fill: false,
        data: data.prices.map(p => p[1]) // price data
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: `${coinName.toUpperCase()} - Last 7 Days VS ${currency}`
    },
    scales: {
      xAxes: [
        {
          type: "time",
          display: true,
          offset: true,
          time: {
            unit: "day"
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: false
          }
        }
      ]
    }
  }
});

  
    //  if(!data[coinName]){
    //     console.log(data)
    //     return ctx.reply(`Could not get ${coinName}`);
    //  }
    //  await client.set(coinName,data[coinName].usd,{EX: 10})
     //ctx.reply(`${coinName}: ${JSON.stringify(data.price[1])}`)

     await ctx.replyWithPhoto(chart.getUrl());

    }catch(err){
        ctx.reply("Error occured while feching data!.")
    }
});



//CBE exchange rate
bot.command("cbe",async(ctx)=>{
const str = ctx.message.text.split(" ");
if(str.length<2){
  return ctx.reply("Usage: /cbe <currency name> e.g /rate USD");
}

const currencyName = str[1].toUpperCase();

const date = new Date().toISOString().slice(0,10);
try{
  const response = await fetch(`https://combanketh.et/cbeapi/daily-exchange-rates/?_limit=1&Date=${date}`,{
    method:'GET',
    headers:{
       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json'
    },

    timeout: 1000
  
  });

  const data = await response.json();

  const rate =data[0].ExchangeRate.map((item)=>({
    t: item.currency.CurrencyAvator.hash,
    name: item.currency.CurrencyName,
    currencyCode: item.currency.CurrencyCode,
    cashBuying:item.cashBuying,
    cashSelling:item.cashSelling,
    tb: item.transactionalBuying,
    ts:item.transactionalSelling
  }));

  
 const temp = rate.filter(item=>{return item.currencyCode === currencyName} );
 console.log(temp);
 
 if(temp.length ==0 ){
  return ctx.reply("The currency code you entered is wrong \n" + " this are the supported currencies\n " + 
    rate.map(item=> item.currencyCode+" "))
 }

 ctx.reply("Commercial Bank of Ethiopia \n"+"Currency Name: " + temp[0].name+"\n"+ "Currency Code: "+ 
  temp[0].currencyCode+"\n" + "Cash Buying: "+
   temp[0].cashBuying+" ETB \n" + "Cash Selling:" 
   +temp[0].cashSelling+ " ETB \n"
  +"Transactional Buying: "+ temp[0].tb + " ETB \n"
+ "Transactional Selling: " + temp[0].ts + " ETB "+temp[0].t);

}catch(err){
 return ctx.reply(`Error occured while fetching data ${err}`)
}
 

});


//National Bank of Ethiopia exchange rate
bot.command("nbe",async(ctx)=>{
  const str = ctx.message.text.split(" ");
 if(str.length<2){
   return ctx.reply("Usage: /nbe currency name e.g /nbe usd")
 }
 const currName = str[1].toUpperCase();
 const date = new Date().toISOString().slice(0,10)
 try{
   const response = await fetch(`https://api.nbe.gov.et/api/filter-exchange-rates?date=${date}`,{
    method: 'GET',
    headers:{
       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json'
    },
    timeout:1000
   });
  
   const data = await response.json();
  //  console.log(data.data.map((item)=>({
  //   name:item.currency.name,
  //   code:item.currency.code,
  //   buyingRate:item.buying,
  //   sellingRate:item.selling,
  //   midRate:item.weighted_average

  //  })))
  const rate =data.data.map((item)=>({
    name:item.currency.name,
    code:item.currency.code,
    buyingRate:item.buying,
    sellingRate:item.selling,
    midRate:item.weighted_average

   }));
   const filter = rate.filter(item=> {return item.code ===currName});


  ctx.reply("National Bank of Ethiopia \n"+"Currency Name: " + filter[0].name + "\n" + "Currency Code: "
     + filter[0].code +"\n" + "Buying Rate: " + filter[0].buyingRate +" ETB \n" 
     + "Selling Rate: " + filter[0].sellingRate + " ETB \n" +  "Mid-Rate: "
     + filter[0].midRate + " ETB")

  }catch(err){
    ctx.reply( `Error while fetching data ${err}`)
  }

});



//Awash Bank exchange Rate
bot.command("awash", async(ctx)=>{

 const str = ctx.message.text.split(" ");

 if(str.length<2){
  return  ctx.reply("Usage: /awash currency name e.g /awash usd")
 }

 const currName = str[1].toUpperCase()
 const response = await fetch(process.env.AWASH_URL,{
   method: 'GET',
    headers:{
       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json'
    },
    timeout:1000
 });
 const text = await response.text();
 
 const match = text.match(/var\s+exchangeRates\s*=\s*(\{[\s\S]*\})/)
 
 
 if(match){

 const jsonString = match[1]
  
 const exchangeObj = JSON.parse(jsonString)

 const exchangeData = Object.entries(exchangeObj).map(([code,data])=>({
  code,
  ...data,
 }));

 

 const fil = exchangeData.find (rate=> rate.code ===currName);

 ctx.reply("Awash Bank " +"\n" + "Code: " + fil.code +"\n" +"Buying: " + fil.buying + "\n" + "Selling: " + fil.selling);
 
  
 }
   else{
    ctx.reply("Data not found");
   }

});

//Oromia bank exchange rate
bot.command("oromia" ,async(ctx)=>{
const message = ctx.message.text.split(" ");

if(message.length<2){
  return ctx.reply("Usage: /oromia currency name e.g /oromia usd");
}

const currName = message[1].toUpperCase();
try{
const response = await fetch(process.env.OROMIA_URL,{
  method: 'GET',
  headers:{
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json'
  },
  timeout: 1000
});
const data = await response.json();
const fil = data.find(item => item.value.currency === currName);


ctx.reply("Oromia Bank " +"\n" + "Currency: " + fil.value.currency + "\n" + "Buying: " + fil.value.cash_buying + "\n" +"Selling: " + fil.value.cash_selling)

}catch(err){
  ctx.reply(err)
}

});

//DBH forex 
bot.command('dbh',async(ctx)=>{
  const str =  ctx.message.text.split(" ");

  if(str.length<2){
    ctx.reply("Usage: /dbh currency name e.g /dbh usd")
  };
  const currName = str[1].toUpperCase();
  try{
  const response = await fetch(process.env.DBH_URL,{
    method: 'GET',
    headers:{
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json'
    },
    timeout:1000
  });

  const data = await response.json();
  const temp = data.data.filter(item=> item.currency.code === currName)

 
  ctx.reply("Currency Name: " + temp[0].currency.name +
    "\n" + "Buying Price: " + temp[0].buying_price + " ETB" +
    "\n" + "Selling Price: " + temp[0].selling_price + " ETB" + 
    "\n" + "Service Charge: " + temp[0].service_charge + " ETB"+
    "\n" + "Branch: "     + temp[0].branch.name  + 
    "\n" + "Address: "    + temp[0].branch.address +
    "\n" + "House No: "   + temp[0].branch.house_number +
    "\n" + "Phone: "      + temp[0].branch.contact_info
  )
  }
  catch(err){
     ctx.reply(err);
  }
});

bot.command('global',async(ctx)=>{

  const str = ctx.message.text.split(" ");

  if(str.length<2){
    ctx.reply("Usage: /global currency name e.g /global usd");
  }


  try{
  const currName = str[1].toUpperCase();
   const responsse = await fetch(process.env.GLOBAL_FOREX_URL,{
    method: 'GET',
    headers:{
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json'
    },
    timeout: 1000

   });

   const data = await responsse.json();

   const dataToBeSent = data.data.filter(item=> item.currencyCode === currName);

    ctx.reply("Global Forex Bureau \n"+"Currency Name: " + dataToBeSent[0].currencyCode+
    "\n" + "Buying Price: " + dataToBeSent[0].buy + " ETB" +
    "\n" + "Selling Price: " + dataToBeSent[0].sell + " ETB" + 
    "\n" + "Service Charge: " + dataToBeSent[0].serviceChargeValue + " ETB"
  )

  }catch(err){
    ctx.reply(err)
  }
})

//the code need recactoring 
bot.start()