myApp.directive('exolChart', ['ChartFactory', 'uiGridConstants', '$rootScope', '$timeout', '$location', '$filter', '$mdDialog', '$uibModal',
  function (ChartFactory, uiGridConstants, $rootScope, $timeout, $location, $filter, $mdDialog, $uibModal) {
    return {
      scope: {
        flowLayout: '@',
        targetId: '@',
        report: '='
      },
      templateUrl: '/components/directives/exolChart.html',
      link: function ($scope, $element) {

        $scope.mergeDatasets = function (oldData, newData, reportId) {
          if (!oldData || !newData || !oldData[reportId] || !newData[reportId]) return;
          newData[reportId].forEach((testDataSet) => {
            if (!testDataSet) return;
            const isMatch = Object.keys($scope.report.filters)
              .every((filter) => testDataSet[filter] === $scope.report.filters[filter]);
            if (isMatch) oldData[reportId].push(testDataSet);
          });
        };

        $scope.flowLayout = $scope.flowLayout ? $scope.flowLayout : false;

        $scope.targetId = $scope.targetId ? $scope.targetId : '';
        if (!$scope.targetId) {
          var parent = $scope.$parent
          while (parent.$parent) {
            parent = parent.$parent;
          }
        }
        $scope.selectedTabIndex = 0;
        $scope.statType = $scope.$parent.statType ? $scope.$parent.statType : '';
        $scope.filtering = $scope.$parent.filtering;
        $scope.reportDuration = $scope.$parent.reportDuration;
        $scope.config = undefined;
        $scope.iconOffset = 1; //$scope.flowLayout?0:1;

        $scope.bands = {
          'all': {text: 'All', value: 'all'},
          '2_4': {text: '2.4 GHz', value: '2_4'},
          '5': {text: '5 GHz', value: '5'},
          '6': {text: '6 GHz', value: '6'}
        };

        $scope.supportedBands = [];

        $scope.filterPopover = {
          show: false,
          template: 'widgetFilters.html'
        };

        $scope.changedFilters = {};

        $scope.openCongestionStats = function (data) {
          $scope.netHealthData = data
          const config = {
            chart: {
              type: 'line'
            },
            title: {
              text: 'Data Port Congestion Events',
              align: 'left'
            },
            time: {
              timezone: $rootScope.tz
            },
            yAxis: {
              title: {
                text: 'Count'
              }
            },
            xAxis: {
              type: 'datetime',
              title: {
                text: '',
                style: {
                  color: '#6D869F',
                  fontSize: '10px'
                }
              },
              autoscaleMargin: 20,
            },
            credits: {
              enabled: false
            },
            plotOptions: {
              series: {
                animation: false,
                marker: {
                  enabled: false
                }
              },
            },
            colors: $rootScope.brandingConfig.chart_colors,
            tooltip: {
              // crosshairs: true,
              crosshairs: {
                width: 2,
                color: 'rgba(0,126,145,0.38)',
                dashStyle: 'solid'
              },
              enabled: true,
              split: false,
              defaultTheme: false,
              borderColor: 'flotTipCharts',
              backgroundColor: '#FFFFFF',
              formatter: function () {
                // var s = Highcharts.dateFormat('%m-%d-%y %H:%M', new Date(this.x));
                var s = moment.tz(this.x, $rootScope.tz).format('MMM DD, YYYY hh:mm:ss A');
                $.each(this.points, function (i, point) {
                  var value = this.y;
                  if (_.isNil(value)) return;
                  s += '<br/> <span style="color:' + point.series.color + '">\u25CF</span>  '
                    + point.series.name + ': ' +
                    value;
                });
                return s;

                // return '<b>' + this.points[0].series.name + '</b><br/>' + Highcharts.dateFormat('%e-%b-%y %l:%M %p', new Date(this.x)) + ': ' + value;
              },
              shared: true,
            },
            series: [],
            responsive: {
              rules: [{
                condition: {
                  maxWidth: 500
                },
                chartOptions: {
                  legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                  }
                }
              }]
            },
            exporting: {
              buttons: {
                contextButton: {
                  menuItems: ["printChart",
                    "separator",
                    // "downloadPNG",
                    // "downloadJPEG",
                    // "downloadPDF",
                    // "downloadSVG",
                    "separator",
                    "downloadCSV",
                    // "downloadXLS",
                    //"viewData",
                    "openInCloud"]
                }
              }
            }
          }
          config.chart.renderTo = 'congestionStatsChart'

          for (const a of $scope.netHealthData.dataPortCongestionEvent[0].statistics) {
            const entry = {
              name: a.statName,
              data: []
            }
            for (const b of a.values) {
              entry.data.push({x: b.timestamp, y: b.numPoints})
            }
            config.series.push(entry)
          }
          $timeout(function () {
            Highcharts.chart(config)
          }, 1)
          $uibModal.open({
            animation: true,
            backdrop: 'static',
            templateUrl: 'congestionStats.html',
            scope: $scope,
            size: 'md1600'
          });
        }

        $scope.getAvailabilityTooltip = function (status) {
          var renderedStatus;
          switch (status) {
            case 'Up, NTP not reachable':
              renderedStatus = $filter('translate')('link_up_ntp_not_reachable');
              break;
            case 'Up':
              renderedStatus = $filter('translate')('link_up')
              break;
            case'Not configured':
              renderedStatus = $filter('translate')('not_configured');
              break;
            case 'Down':
              renderedStatus = $filter('translate')('link_down')
              break;
          }
          return renderedStatus;
        };

        $scope.$parent.$watch('tabs.selectedTab', function (selectedTab) {
          $scope.selectedTabIndex = selectedTab;
        });

        /*
        todo: Breaks Expert views
        $scope.$parent.$watch('reportData', function (newData, oldData) {
            if (newData && $scope.report) {
                if (!$scope.doNotMerge && (!$scope.reportData || newData.reportDuration == $scope.reportData.reportDuration)) {
                    ExolUtils.mergeDatasets($scope.reportData, newData, $scope.report.id);
                } else {
                    $scope.doNotMerge = false;
                }
                $scope.reportData = newData;
                $scope.initReport();
            }

        });*/
        $scope.$parent.$watch('reportData', function (newData, oldData) {
          if (newData && $scope.report) {
            $scope.reportData = newData;
            $scope.initReport();
          }

        });

        $scope.$watch('report', function (newReport, oldReport) {
          if (!$scope.reportData || !$scope.report) {
            $scope.config = undefined;
            return;
          }
          $scope.initReport();
        });


        $scope.widgetWithCheckbox = ['usagePerNetwork', 'clientsPerNetwork', 'throughputPerNetwork', 'smartPollBaseliningSiteRTT', 'smartPollBaseliningSitePacketLoss'];
        $scope.labelCheckboxList = {};
        $scope.withCheckboxWidgetBackupData = {};

        $scope.selectReportLines = function (cb, reportId) {
          var reportDataSet = {};
          var statistics = [];
          var kept = false;
          _.forEach($scope.withCheckboxWidgetBackupData[$scope.reportId], function (reportDataItem, idx) {
            if ($scope.labelCheckboxList[$scope.reportId][idx].enabled) {
              var tempS = angular.copy(reportDataItem.statistics);
              _.forEach(tempS, function (el, index) {
                if (el.statName === 'Mean') {
                  el.statName = reportDataItem.reportName.replace('Round Trip Time ', "").replace('Packet Loss ', "");
                }
              });
              //only leave one 25 Percentile and 75 percentile
              if (kept) {
                tempS = _.remove(tempS, function (t, index) {
                  if (index < 2) {
                    return t
                  }
                  ;
                });
              }
              kept = true;

              statistics = statistics.concat(tempS);
            }
          })

          reportDataSet.statistics = statistics;

          ChartFactory.updateChart($scope.config, $scope.reportId, reportDataSet, $scope.reportData);
        }

        $scope.selectLine = function (cb, reportId) {
          if (cb.enabled) {
            _.forEach($scope.withCheckboxWidgetBackupData[reportId][0].statistics, function (el, idx) {
              if (el.statName == cb.name) {
                var temp = angular.copy(el);
                $scope.reportData[reportId][0].statistics.push(temp);
              }
            });
          } else {
            _.forEach($scope.reportData[reportId][0].statistics, function (el, idx) {
              if (el && el.statName == cb.name) {
                const index = $scope.reportData[reportId][0].statistics.indexOf(el);
                $scope.reportData[reportId][0].statistics.splice(index, 1);
              }
            });

          }

          for (var i = 0; i < $scope.reportData[$scope.reportId].length; i++) {
            var testDataSet = $scope.reportData[$scope.reportId][i];

            var found = true;
            for (var filter in $scope.report.filters) {
              if (testDataSet !== undefined) {
                if (testDataSet[filter] != $scope.report.filters[filter]) {
                  found = false;
                  break;
                }
              }
            }
            if (found) {
              reportDataSet = testDataSet;
              break;
            }
          }
          ChartFactory.updateChart($scope.config, $scope.reportId, reportDataSet, $scope.reportData);
        }

        $scope.initReport = function () {
          if ($scope.reportId === 'systemHealth') {
            if ($rootScope.notificationPromise) return;
            $rootScope.loadAndProcessNotifications();
          }

          if ($scope.report) {
            $scope.reportId = $scope.report.id;
            // Don't display filters on switch pages.
            if (!_.isUndefined($scope.reportData)) {
              if (($scope.reportData.hasOwnProperty('portAttributesMap') || $scope.reportData.hasOwnProperty('actualPortSpeed')) && $scope.reportId === 'byteUtilization') {
                $scope.report.supportedFilters = undefined;
              }
            }
            if (!$scope.label || $scope.reportId != $scope.report.id) $scope.label = $scope.report.label;
            $scope.barTable = $scope.report.barTable ? $scope.report.barTable : false;
            $scope.filteringSupported = $scope.report.supportedFilters !== undefined;
            if ($scope.filteringSupported) {
              $scope.bandFiltering = $scope.report.supportedFilters.band !== undefined;
              if ($scope.bandFiltering) {
                let band6Filtering = false;
                let apDash = false;
                $scope.band24 = $scope.report.supportedFilters.band.indexOf('2_4') >= 0;
                $scope.band5 = $scope.report.supportedFilters.band.indexOf('5') >= 0;

                if ($scope.$parent.ap !== undefined && $scope.$parent.ap.radios) {
                  apDash = true;
                  for (const radio of $scope.$parent.ap.radios) {
                    if (radio.radioName.includes('6 GHz')) {
                      band6Filtering = true;
                    }
                  }
                }
                if (band6Filtering) {
                  $scope.band6 = $scope.report.supportedFilters.band.indexOf('6') >= 0;
                }
                if (!apDash) {
                  $scope.band6 = $scope.report.supportedFilters.band.indexOf('6') >= 0;
                }
                if (apDash &&  !band6Filtering) {
                  $scope.band6 = null;
                }
                $scope.bandAll = $scope.report.supportedFilters.band.indexOf('all') >= 0;
                $scope.supportedBands = [];
                if ($scope.bandAll) $scope.supportedBands.push($scope.bands['all']);
                if ($scope.band24) $scope.supportedBands.push($scope.bands['2_4']);
                if ($scope.band5) $scope.supportedBands.push($scope.bands['5']);
                if ($scope.band6) $scope.supportedBands.push($scope.bands['6']);
                if ($scope.report.filters && $scope.report.filters.band) {
                  var filterName = Object.keys($scope.report.supportedFilters)[0]
                  $scope.displayFilters = filterName[0].toUpperCase() + filterName.slice(1) + ': ' + $scope.bands[$scope.report.filters.band].text;
                }
              }
            }
            $scope.table = $scope.report.table ? $scope.report.table : false;
            $scope.isTreemap = $scope.report.isTreemap ? $scope.report.isTreemap : false;
            $scope.treemapUrl = $scope.report.treemapUrl ? $scope.report.treemapUrl : '';

            if ($scope.reportData) {
              if (!$scope.reportData[$scope.reportId]) return;
              _.forEach($scope.widgetWithCheckbox, function (widgetId) {
                if (widgetId in $scope.reportData) {
                  $scope.withCheckboxWidgetBackupData[widgetId] = angular.copy($scope.reportData[widgetId]);

                  var tempC = [];

                  if (widgetId == 'smartPollBaseliningSiteRTT' || widgetId == 'smartPollBaseliningSitePacketLoss') {
                    _.forEach($scope.reportData[widgetId], function (el, idx) {
                      tempC.push({
                        name: el.reportName.replace('Round Trip Time ', "").replace('Packet Loss ', ""),
                        enabled: true
                      })
                    });
                    $scope.labelCheckboxList[widgetId] = tempC;

                  } else {
                    _.forEach($scope.reportData[widgetId][0].statistics, function (el, idx) {
                      tempC.push({name: el.statName, enabled: true})
                    });
                    $scope.labelCheckboxList[widgetId] = tempC;

                  }
                }
              });

              var reportDataSet = undefined;

              //hack for broken reports and backwards compatibility of servers
              if (!_.isArray($scope.reportData[$scope.reportId])) $scope.reportData[$scope.reportId] = [$scope.reportData[$scope.reportId]];

              for (var i = 0; i < $scope.reportData[$scope.reportId].length; i++) {
                var testDataSet = $scope.reportData[$scope.reportId][i];


                if ($scope.reportId === 'smartPollBaseliningSiteRTT' || $scope.reportId === 'smartPollBaseliningSitePacketLoss') {
                  _.forEach(testDataSet.statistics, function (el, idx) {
                    if (el.statName === 'Mean') {
                      el.statName = testDataSet.reportName.replace('Round Trip Time ', "").replace('Packet Loss ', "");
                    }
                  });

                  if (i > 0) {
                    testDataSet.statistics = _.remove(testDataSet.statistics, function (t, index) {
                      if (index < 2) {
                        return t
                      }
                      ;
                    });
                  }

                  if (reportDataSet && reportDataSet.statistics) {
                    var tempReportDataSet = reportDataSet.statistics;
                    var tempTestDataSet = testDataSet.statistics;

                    reportDataSet.statistics = tempReportDataSet.concat(tempTestDataSet);
                  } else {
                    reportDataSet = testDataSet;
                  }
                } else {
                  var found = true;
                  for (var filter in $scope.report.filters) {
                    if (testDataSet !== undefined) {
                      if (testDataSet[filter] != $scope.report.filters[filter]) {
                        found = false;
                        break;
                      }
                    }
                  }
                  if (found) {
                    reportDataSet = testDataSet;
                    break;
                  }
                }
              }
              $scope.config = ChartFactory.getConfig($scope.reportId, $scope.reportData.reportDuration);
              if ($scope.dashboardMode && $scope.dashboardMode.editing && $scope.config) {
                delete $scope.config['crosshair'];
              }
              if ($scope.reportId != 'deploymentQoE' && $scope.reportId != 'siteQoE' && $scope.reportId != 'apQoE') {
                ChartFactory.updateChart($scope.config, $scope.reportId, reportDataSet, $scope.reportData);
              }

            }
            $scope.hideChart = $scope.report.hideChart ? $scope.report.hideChart : false;
          }
        };

        $scope.$parent.$watch('dashboardMode', function (mode) {
          $scope.dashboardMode = mode;
          $scope.initReport();
        });

        $scope.$parent.$watch('filtering.showFilters', function () {
          $scope.hideChart = true;
          $scope.initReport();
        });

        $scope.filterChanged = function (filterName, filterValue) {
          $scope.doNotMerge = true;
          $scope.filterPopover.show = false;
          $scope.changedFilters[filterName] = filterValue;

          var filterStr = '';
          for (var filterName in $scope.changedFilters) {
            filterStr += ', ' + filterName + ": " + $scope.changedFilters[filterName];
          }
          $scope.displayFilters = filterStr.substr(2);
          $scope.loadReportingData();
        }

        $scope.loadReportingData = function () {
          $scope.$parent.loadReportingData();
        }

        $scope.showNoData = function () {
          if (!$scope.config) return false;
          return !$scope.config.series || $scope.config.series.length < 1;
        }

        $scope.showFilters = function () {
          return $scope.filtering.showFilters && $scope.filteringSupported;
        }

        $scope.showChart = function () {
          //console.log('scope',$scope);
          if ($scope.hideChart) return false;
          if ($scope.table || $scope.barTable) return true;

          if (!$scope.config) return false;
          return $scope.config.series && $scope.config.series.length > 0;
        }

        $scope.openTreemap = function () {
          //only one URL for now
          $location.url('/report/treemap/' + $scope.treemapUrl + '/' + $scope.statType + '/' + $scope.targetId + '?name=' + $scope.label + '&format=renderBytesPerSecond');
        }

        $scope.initReport();

        $scope.openCausedByList = function (causeList) {
          $mdDialog.show({
            locals: {
              causeList: causeList
            },
            controller: (['$scope', '$rootScope', '$mdDialog', '$sce', 'uuid', '$uibModal',
              'AuthenticationFactory', 'causeList',
              ($scope, $rootScope, $mdDialog, $sce, uuid, $uibModal,
                AuthenticationFactory, causeList) => {
                $scope.causeList = causeList;

                $scope.cancel = function () {
                  $mdDialog.cancel();
                }

                $scope.openEntity = function (type, name, id) {
                  let url = "workflow/";
                  switch (type) {
                    case 'Profile':
                      url += 'profile/' + name;
                      break;
                    case 'AAAPolicy':
                      url = 'aaa-policy/' + name;
                      break;
                    case 'Adsp':
                      url += 'adsp/' + name;
                      break;
                    case 'Analytics':
                      url += 'analytics/' + name;
                      break;
                    case 'Ap':
                      url = 'device/' + id;
                      break;
                    case 'Iot':
                      url += 'iot/' + name;
                      break;
                    case 'Cos':
                      url = 'cos/' + name;
                      break;
                    case 'Positioning':
                      url += 'positioning/' + name;
                      break;
                    case 'Rfmgmt':
                      url += 'rfMgmt/' + name;
                      break;
                    case 'Role':
                      url = 'role/' + name;
                      break;
                    case 'Switch':
                      url = 'switch/' + id;
                      break;
                    case 'Service':
                      url = 'network/' + name;
                      break;
                    case 'Rtls':
                      url += 'rtls/' + name;
                      break;
                    case 'Topology':
                      url = 'vlan/' + name;
                      break;
                    case 'Site':
                      url = 'site/' + name;
                      break;
                    case 'PhysicalInterface':
                    case 'L2port':
                    case 'Dns':
                      url = 'system#Interfaces';
                      break;
                    case 'Backup':
                      url = 'system#SoftwareUpgrade';
                      break;
                    case 'Ntp':
                      url = 'system#NetworkTime';
                      break;
                    case 'Availability':
                      url = 'system#Availability';
                      break;
                    case 'License':
                      url = 'system/license';
                      break;
                    case 'Mu':
                      url = `client/report/${id}#Details`
                      break;
                    default:
                      url += 'core/appliance';
                  }

                  $mdDialog.cancel(true);
                  $location.url(url);
                }
              }]),
            templateUrl: 'bestPracticesCauseList.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: false
          });
        }
      }
    };
  }]);
