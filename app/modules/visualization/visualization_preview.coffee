engineApp.directive "visualizationPreview", ["$window", "$timeout", "d3Service",
  ($window, $timeout, d3Service) ->
    return (
      restrict: "EA"
      scope:
        vizType: "="
        vizSpec: "="
        vizData: "="
        conditional: "="
        label: "@"
        onClick: "&"

      link: (scope, ele, attrs) ->
        d3Service.d3().then (d3) ->
          renderTimeout = undefined
          $window.onresize = ->
            scope.$apply()

          # Resizing
          scope.$watch ( ->
            angular.element($window)[0].innerWidth
          ), ->
            scope.render(scope.vizType, scope.vizSpec, scope.vizData, scope.conditionalData)

          scope.$watchCollection("[vizType,vizSpec,vizData,conditional]", ((newData) ->
            scope.render(newData[0], newData[1], newData[2], newData[3])
          ), true)

          scope.render = (vizType, vizSpec, vizData, conditional) ->
            unless (vizData and vizSpec and vizType and conditional)
              return

            clearTimeout renderTimeout if renderTimeout
            renderTimeout = $timeout(->

              getTitle = (vizType, vizSpec, conditional) ->
                title = ''
                if vizType in ['treemap', 'piechart']
                  title += ('Group all ' + vizSpec.aggregate.title + ' by ' + vizSpec.groupBy.title.toString())
                  if (vizSpec.condition.title)
                    title += (' given a ' + vizSpec.condition.title.toString())
                else if vizType in ['scatterplot', 'barchart', 'linechart']
                  return
                return title

              if condition
                condition = vizSpec.condition.title.toString()

                if conditionalData.length < 300
                  dropdown = d3plus.form()
                    .container("div#viz-container")
                    .data(conditionalData)
                    .title("Select Options")
                    .id(condition)
                    .text(condition)
                    .type("drop")
                    .title(condition)
                    .draw()

              d3PlusTitleMapping =
                treemap: 'tree_map'
                piechart: 'pie'
                barchart: 'bar'
                scatterplot: 'scatter'
                linechart: 'line'
                geomap: 'geo_map'

              viz = d3plus.viz()
                .container("div#viz-container")
                .width($("section.viewport").width() - 40)
                .margin("20px")
                .height(600)
                .data(vizData)
                .font(family: "Karbon")

              if vizType in ["treemap", "piechart"]
                viz.type(d3PlusTitleMapping[vizType])
                  .title(getTitle(vizType, vizSpec))
                  .id(vizSpec.groupBy.title.toString())
                  .size("count")
                  .draw()

              else if vizType in ["scatterplot", "barchart", "linechart"]
                x = vizSpec.x.title
                agg = vizSpec.aggregation
                if agg
                  viz.type(d3PlusTitleMapping[vizType])
                    .title(getTitle(vizType, vizSpec))
                    .x(x)
                    .y("count")
                    .id(x)
                    .draw()
                else
                  y = vizSpec.y.title
                  viz.type("scatter")
                    .title(getTitle(vizType, vizSpec))
                    .x(x)
                    .y(y)
                    .id(x)
                    .draw()

              else if vizType in ["geomap"]
                viz.type(d3PlusTitleMapping[vizType])
                  .title(getTitle(vizType, vizSpec))
                  .coords("/assets/countries.json")
                  .id(vizSpec.groupBy.title.toString())
                  .color("count")
                  .size("count")
                  .draw()
            , 200)
            return

          return

        return
    )
]