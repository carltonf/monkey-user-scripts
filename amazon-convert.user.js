// ==UserScript==
// @name        Amazon Currency Conversion
// @namespace   carltonf.github.io
// @description Automatically converts different currencies into your home currency, more convenient for overseas shopping.
// @include     http://www.amazon.com/*
// @include     http://www.amazon.co.jp/*
// @version     0.3
// @grant       none
// ==/UserScript==

'use strict';

// * Extra info
var CurSymMap = {
  'CNY': '¥',
  // amazon.co.jp uses a Yen symbol in JP locale (it seems)
  'JPY': '￥',
  'USD': '$',
};

// As 2015-10-31
var CurRates = {
  'JPY-CNY': 0.05237,
  'USD-CNY': 6.3185,
}

// * Setup
// Get the 
var origCur = null;
switch (document.location.hostname){
case "www.amazon.com":
  origCur = 'USD';
  break;
case "www.amazon.co.jp":
  origCur = 'JPY';
  break;
default:
  throw new Error(`${document.location.hostname} is NOT supported!`);
}

// * Main converter for price
// for now only 'CNY' as target, so targetCur is pre-fixed.
function PriceConverter (origCur, targetCur){
  var self = this;


  this._origCur = origCur;
  this._targetCur = targetCur || 'CNY';

  // ** Price string conversion
  // accept a string in format like "$ 130" and outputs a string in the target
  // currency.
  this.convertPriceStr = convertPriceStr
  function convertPriceStr(str){
    var origSym = CurSymMap[self._origCur],
        targetSym = CurSymMap[self._targetCur],
        origNum = -1,
        targetNum = -1;

    // *** Extract the number part
    str = str.substring( str.indexOf(origSym) + 1 ).trim().replace(',', '');
    origNum = Number(str);

    // *** Convert currency
    targetNum = origNum * CurRates[`${self._origCur}-${self._targetCur}`];

    // *** output in the currency
    // TODO the locale is fixed to Chinese
    var numberFormat = new Intl.NumberFormat("zh-Hans-CN",
                                             { style: 'currency',
                                               currency: this._targetCur,
                                               maximumFractionDigits: 1,
                                             });

    // also separates the symbol and number with a space
    // with right locale, no need to add currency symbol manually
    return numberFormat.format(targetNum);
  };
}

var priceConverter = new PriceConverter(origCur);

// * Mainpulate the page price tags
// Return an array of elements
function getPriceTagAll(){
  function isPriceTag (elm){
    return elm.textContent.includes(CurSymMap[origCur]);
  }

  var priceTags = [].filter.call(document.querySelectorAll('span'),
                                 isPriceTag);

  return priceTags;
}


function changePriceTag(priceTag){
  priceTag.innerText = priceConverter.convertPriceStr(priceTag.textContent);
}

getPriceTagAll().forEach(changePriceTag);
