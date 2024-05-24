
$(function() {
  const $canvas = $('#col-canvas');
  if (!$canvas.length) {
    return;
  }

  // basic settings
  const baseRadius = 100;
  const scale = 2.5;
  const radius = baseRadius * scale;
  const diameter = radius * 2;
  const data = [];

  // helper function to get linear a
  const getDistance = (x, y, dx, dy) => {
    return Math.sqrt(Math.pow((dx - x), 2) + Math.pow(dy - y, 2));
  };

  // set up the different slices
  const categories = [
    {
      field: 'creativity',
      name: 'Creativity'
    },
    {
      field: 'finances',
      name: 'Finances'
    },
    {
      field: 'career',
      name: 'Career'
    },
    {
      field: 'education',
      name: 'Education'
    },
    {
      field: 'health',
      name: 'Health'
    },
    {
      field: 'physical_activity',
      name: 'Physical Activity'
    },
    {
      field: 'home_cooking',
      name: 'Home Cooking'
    },
    {
      field: 'home_environment',
      name: 'Home Environment'
    },
    {
      field: 'relationships',
      name: 'Relationships'
    },
    {
      field: 'social_life',
      name: 'Social Life'
    },
    {
      field: 'joy',
      name: 'Joy'
    },
    {
      field: 'spirituality',
      name: 'Spirituality'
    }
  ];
  
  // remove text selection since we will be clicking on this guy a fair bit
  $canvas.attr('unselectable', 'on')
    .css({
      '-moz-user-select': 'none',
      '-o-user-select': 'none',
      '-khtml-user-select': 'none',
      '-webkit-user-select': 'none',
      '-ms-user-select': 'none',
      'user-select': 'none'
    }).bind('selectstart', function () {
      return false;
    });

  // set up the canvas
  const raphael = Raphael('col-canvas', diameter, diameter);
  const slicesConfig = [];
  const slicesTotal = categories.length;

  for (let i = 0; i < slicesTotal; i++) {
    slicesConfig.push(1);
  }

  // make the piechart object
  const pieChart = raphael.piechart(radius, radius, radius, slicesConfig, {strokewidth: 2});
  
  const setFluidSvgCanvas = () => {
    const maxWidth = 992;
    const width = $(window).width();
    
    const $canvasSvg = $('#col-canvas > svg');
    
    if ($canvasSvg) {
      $canvasSvg.wrap('<div class="svg-wrapper"/>')
      $canvasSvg.attr('id', 'raphael-svg');
      $('#raphael-svg').append($(`<div id="col-lines"></div>`))
    }
    
    // we check our width for mobile sizes to set a 
    // viewBox/size method to control responsiveness
    if (width < maxWidth) {
      raphael.setViewBox(0, 0, diameter, diameter, true);
      raphael.setSize('100%', '100%');
    }
    else {
      raphael.setSize(diameter, diameter);
    }
  };
  $(document).ready(setFluidSvgCanvas);
  $(window).resize(setFluidSvgCanvas);
  
  // iterate through categories array to match id set to dom element
  // if true return the category name as a data attribute to give css control
  function addSlice(index) {
    $(this).attr({data: index});

    for (const [categoryIndex, category] of categories.entries()) {
      const {
        field,
        name
      } = category;

      if (categoryIndex === index) {
        $canvas.prepend($(`<span class="${field} slice" data-field="${field}" data-name="${name}" data-id="${categoryIndex}"><div class="inner">${name}</div></span>`));
        $(this).attr({'data-name': name});
        return;
      }
    }
  }

  $canvas.find('path').each(addSlice);

  const circleDegrees = 360;
  const circles = [];

  for (let i = 0; i < slicesTotal; i++) {
    const angleOffset = 90;
    const angle = i * circleDegrees / slicesTotal + angleOffset;
    const circle = raphael.circle(radius, radius, 5)
      .attr({
        fill: 'black',
        stroke: 0
      })
      .rotate(angle, radius, radius);
    circles.push(circle);
  }

  pieChart.click(function () {
    const sid = this.sector.id;
    const sidField = categories[sid].field;
    const angle = sid * 360 / slicesTotal;
    const event = this.eventData;
    const pageOffset = $canvas.find('svg').offset();
    const positionX = event.pageX - pageOffset.left;
    const positionY = event.pageY - pageOffset.top;
    const distance = getDistance(radius, radius, positionX, positionY);
    const snap = Math.ceil(distance / radius * 10);

    const score =  categories[sid].score = snap;
    const circleArea = circles[sid].attr({cx: radius - distance});

    sessionStorage.setItem(sidField, score);
 });
});

