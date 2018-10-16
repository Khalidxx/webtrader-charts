import $ from 'jquery';
import Highcharts from 'highstock-release/highstock';
import popup from "./properties_selector.js";
import {i18n} from '../common/utils.js';

/*
This is a map storing information as -
verticalLineOptions[seriesID] = {
   stroke : 'red',
   strokeWidth : 1,
   dashStyle : 'dash',
   parentSeriesID : seriesID
}
 */
let verticalLineOptionsMap = {};

export const init = function(refererChartID) {
   const H = Highcharts;
   //Make sure that HighStocks have been loaded
   if (!H) return;

   const chart = $(refererChartID).highcharts();

   const options = {};
   options.title = i18n('Vertical line');
   options.inputValues = [{
      name: i18n('Stroke width'),
      type: 'number',
      id: 'width',
      default: 2,
      min: 1,
      max: 5
   }, {
      name: i18n('Stroke color'),
      type: 'colorpicker',
      id: 'color',
      default: '#ff0000'
   }];
   popup.open(options, addEvent);

   function addEvent(css) {
      H.addEvent(chart, 'click', function(evt) {
         if (chart.annotate) {
            chart.annotate = false;
            addPlotLines(evt.xAxis[0].value, evt.xAxis[0].axis, css);
            H.removeEvent(chart, 'click');
         }
      });
   }

   function addPlotLines(value, axis, css) {
      const uniqueID = 'verticalLine_' + new Date().getTime();
      const options = {
         value: value,
         width: 2,
         color: '#ff0000',
         dashStyle: 'shortdash',
         id: uniqueID
      };
      if (css) {
         $.extend(options, css);
      }
      const line = axis.addPlotLine(options).svgElem
         .css({ 'cursor': 'pointer' })
         .attr('id', uniqueID)
         .translate(0, 0)
         .on('mousedown', updateverticalLine)
         .on('dblclick', removeLine);
      verticalLineOptionsMap[uniqueID] = line;
      return line;
   }

   function updateverticalLine(evt) {
      chart.annotate = true;
      const lineID = $(this).attr('id');
      let line = verticalLineOptionsMap[lineID],
         mouseUpEventAdded = false;

      H.wrap(H.Pointer.prototype, 'drag', function(c, e) {
         if (chart.annotate) {
            if (!mouseUpEventAdded) {
               mouseUpEventAdded = true;
               $(refererChartID).one("mouseup", function() {
                  chart.annotate = false;
                  mouseUpEventAdded = false;
               });
            }
            if (chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop)) {
               if (line.element) {
                  const value = chart.xAxis[0].toValue(e.chartX),
                     axis = chart.xAxis[0],
                     css = {
                        color: line.stroke,
                        width: line["stroke-width"]
                     };
                  removeLineWithID(line.element.id);
                  line = addPlotLines(value, axis, css);
               }
            }

         } else {
            c.call(this, e);
         }
      });
   }

   function removeLine(evt) {
      const lineID = $(this).attr('id');
      removeLineWithID(lineID)
   }

   function removeLineWithID(lineID) {
      // Remove all associated events.
      $("#" + lineID).off();
      delete verticalLineOptionsMap[lineID];
      chart.xAxis[0].removePlotLine(lineID);
   }

}

export default {
   init
}
