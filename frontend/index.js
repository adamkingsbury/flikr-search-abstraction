import Vue from 'vue';
import _ from 'lodash';
import aj from 'jquery';

var debounceRate = 2000;

var app = new Vue({
  el: '#app',
  data: {
    searchText: "",
    searchPerPageValue: null,
    searchPageOffset: null,
    searchResult: "",
    searchResultsValid: false,
    searchEnabled: false,
    searchQueryIsDirty: false,
    searchIsCalculating: false,
    searchResultTab: "card",
    computedSearchValue: "Not done yet",
    historyResult: "",
    historyEnabled: false,
    historyPerPageValue: null,
    historyPageOffset: null,
    historyQueryIsDirty: false,
    historyIsCalculating: false,
    computedHistoryValue: "Not done yet",
    
  },
  watch: {
    searchText: function () {
      this.searchQueryIsDirty = true
      this.searchOperation()
    },
    searchPerPageValue: function () {
      this.searchQueryIsDirty = true
      this.searchOperation()
    },
    searchPageOffset: function () {
      this.searchQueryIsDirty = true
      this.searchOperation()
    },
    searchResult: function () {
      if (this.historyEnabled) {
        this.historyIsCalculating = true;
        this.computeHistory();
      }
    },
    historyEnabled: function () {
      if (this.historyEnabled) {
        this.historyQueryIsDirty = true;
        this.historyOperation();
      }
    },
    historyPerPageValue: function () {
      this.historyQueryIsDirty = true;
      this.historyOperation();
    },
    historyPageOffset: function () {
      this.historyQueryIsDirty = true;
      this.historyOperation();
    }
  },
  computed: {
    searchResultRows: function() {
      
      var sResultObj = JSON.parse(this.searchResult);
      
      var pair = [];
      var rows = [];
      var itemCount = 0;
      for (let i of sResultObj) {
        pair.push(i);
        itemCount += 1;
        if (itemCount === 2){
          itemCount = 0;
          rows.push(pair);
          pair = [];
        }
      }
      if (pair.length > 0) rows.push(pair);
      return rows;
    },
    
    searchResultHeight: function(){
      return Math.max(1, this.searchResult.split('\n').length)
    },
    
    historyResultHeight: function(){
      return Math.max(1, this.historyResult.split('\n').length)
    },
    
    searchResultTabIsRaw: function(){
      return this.searchResultTab === 'raw';
    },
    
    searchResultTabIsFormatted: function(){
      return this.searchResultTab === 'card';
    }
  },
  methods: {
    searchOperation: _.debounce(function () {
      this.searchIsCalculating = true;
      this.computeSearch();
    }, debounceRate),
    
    computeSearch: function (){
      var result = ""
      var validResult = false;
      if (this.searchText.length > 0) {
        validResult = true;
        result += "https://earthy-brace.glitch.me/search/" +  encodeURI(this.searchText) ;
        this.searchPerPageValue > 0 || this.searchPageOffset > 0 ? result += "?" : result +="";
        this.searchPerPageValue > 0 ? result += "per_page=" + this.searchPerPageValue : result +="";
        this.searchPerPageValue > 0 && this.searchPageOffset > 0 ? result += "&" : result +="";
        this.searchPageOffset > 0 ? result += "offset=" + this.searchPageOffset : result +="";
      }
      else {
        result = "Search String required";
      }
      if (validResult) this.callAPI(result, this);
      this.computedSearchValue = result;
      return result;
    },
    
    historyOperation: _.debounce(function () {
      this.historyIsCalculating = true;
      this.computeHistory();
    }, debounceRate),
    
    computeHistory: function (){
      var result = "https://earthy-brace.glitch.me/history";
      if (this.historyPerPageValue > 0 || this.historyPageOffset > 0) result += "?";
      if (this.historyPerPageValue > 0) result += "per_page=" + this.historyPerPageValue;
      if (this.historyPerPageValue > 0 && this.historyPageOffset > 0) result += "&";
      if (this.historyPageOffset > 0) result += "offset=" + this.historyPageOffset;
      
      this.callHistoryAPI(result, this);
      this.computedHistoryValue = result;
      return result;
    },
    
    callAPI: function(url, caller){
      aj.ajax( url )
        .done(function(data) {
          caller.searchResultsValid = true;
          caller.searchResult = JSON.stringify(data, null, 3);
        })
        .fail(function(err) {
          caller.searchResultsValid = false;
          caller.searchResult = err;
        })
        .always(function(){
          caller.searchIsCalculating = false;
          caller.searchQueryIsDirty = false;
        }); 
    },
    
    callHistoryAPI: function(url, caller){
      aj.ajax( url )
        .done(function(data) {
          caller.historyResult = JSON.stringify(data, null, 3);
        })
        .fail(function(err) {
          caller.historyResult = err;
        })
        .always(function(){
          caller.historyIsCalculating = false;
          caller.historyQueryIsDirty = false;
        });
      
    }
    
  }
});