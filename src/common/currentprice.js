import $ from 'jquery';
import Highcharts from 'highstock-release/highstock';
import { toFixed } from '../common/utils.js';

function removePlotLine() {
   var series = this;
   for(var i=0; i< this.yAxis.plotLinesAndBands.length; i++) {
      var plotLine = this.yAxis.plotLinesAndBands[i];
      if (plotLine.options.id && plotLine.options.id.indexOf(series.options.id + '_CurrentPrice') == 0) {
         series.yAxis.removePlotLine(plotLine.options.id);
         return false;
      }
   };
}


export const init = () => {
   (function(H) {
      //Make sure that HighStocks have been loaded
      //If we already loaded this, ignore further execution
      if (!H || H.Series.prototype.addCurrentPrice) return;

      H.Series.prototype.addCurrentPrice = function ( currentPriceOptions ) {

         //Check for undefined
         //Merge the options
         var seriesID = this.options.id;
         currentPriceOptions = $.extend({
            stroke : '#c03',
            strokeWidth : 1,
            dashStyle : 'line',
            parentSeriesID : seriesID
         }, currentPriceOptions);

         //If this series has data, add CurrentPrice series to the chart
         var data = this.data || [];
         if (data && data.length > 0)
         {

            var lastData = data[data.length - 1];
            if(lastData){
               var price = lastData.y || lastData.close || lastData[4];
               if (price > 0.0) {
                  addPlotLines.call(this, currentPriceOptions, price);
               }
            }
         }

      };

      H.Series.prototype.removeCurrentPrice = function () {
         removePlotLine.call(this);
      };

      /*
       *  Wrap HC's Series.addPoint
       */
      H.wrap(H.Series.prototype, 'addPoint', function(proceed, options, redraw, shift, animation) {

         proceed.call(this, options, redraw, shift, animation);
         updateCurrentPriceSeries.call(this, options[0]);

      });

      /*
       *  Wrap HC's Point.update
       */
      H.wrap(H.Point.prototype, 'update', function(proceed, options, redraw, animation) {

         proceed.call(this, options, redraw, animation);
         var series = this.series;
         //Update CurrentPrice values
         updateCurrentPriceSeries.call(series, this.x, true);

      });

      /**
       * This function should be called in the context of series object
       * @param time - The data update values
       * @param isPointUpdate - true if the update call is from Point.update, false for Series.update call
       */
      function updateCurrentPriceSeries(time, isPointUpdate) {
         //if this is CurrentPrice series, ignore
         var series = this;
         var lastData = series.options.data[series.data.length - 1];
         var yAxis = this.yAxis;
         $.each(yAxis.plotLinesAndBands, function (i, plotLine) {

            var options = plotLine.options;

            if (options.id && options.id.indexOf(series.options.id + '_CurrentPrice') == 0) {
               series.yAxis.removePlotLine(options.id);
               //get close price from OHLC or the current price of line charts
               var price = lastData.y || lastData.close || lastData[4] || lastData[1];
               addPlotLines.call(series, options, price);
               return false;
            }

         });
      }

      function addPlotLines(currentPriceOptions, price) {
         var zIndex = this.chart.series.length + 1;
         var isChange = false;
         if (!this.data[this.data.length - 1]) return;

         if ($.isNumeric(this.data[this.data.length - 1].change)) {
            isChange = true;
            price = toFixed(this.data[this.data.length - 1].change, 2);
         }
         this.yAxis.addPlotLine({
            id: this.options.id + '_CurrentPrice_' + Date.now(),
            color: currentPriceOptions.stroke || currentPriceOptions.color,
            dashStyle: currentPriceOptions.dashStyle,
            width: currentPriceOptions.strokeWidth || currentPriceOptions.width,
            value: price,
            zIndex: 4,
            textAlign: 'left',
            label: {
               align: 'left',
               text:  price + (isChange ? '%' : ''),
               style: {
                  'display': 'inline-block',
                  'background': '#c03',
                  'color' : 'white',
                  'font-size': '10px',
                  'line-height': '14px',
                  'padding' : '0 4px',
               },
               x: 0,
               y: 4.3,
               useHTML: true,
            }
         });
      }

   }(Highcharts));
};

export default { init };

