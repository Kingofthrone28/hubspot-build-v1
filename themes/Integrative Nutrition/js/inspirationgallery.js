(function () {
  /* Checking if IE */
  try {
    if(window.navigator.userAgent.indexOf("MSIE ") > 0 || window.navigator.userAgent.indexOf("Trident/") > 0) {
      var css = '.amenities-entry { display: block !important; }',
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');
      head.appendChild(style);
      style.type = 'text/css';
      if (style.styleSheet){
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }
  } catch(e) {  }

  /* Loading all posts */
  var allPosts = [];
  /* Current filtered data set */
  var filteredPosts = [];
  var apiUrl = "https://api.hubapi.com/hubdb/api/v2/tables/3411098/rows?portalId=8382392";
  $.get( apiUrl, function( data ) {
    data.objects.forEach(function(row) {
      var cat = '';
      if(Array.isArray(row.values["4"])) {
         row.values["4"].forEach(function(c) {
           cat += c.name + ' ';
         });
      } else if(row.values["4"].name) {
        cat = row.values["4"].name;
      }
      console.log(cat);
      allPosts.push({
        body_text: row.values["2"] || '',
        title: row.values["1"] || '',
        image: row.values["3"] ? row.values["3"].url : null,
        category: cat,
        learn_more: row.values["5"] || null,
        wtb: row.values["6"] || null,
        credit: row.values["7"] || ''
      });
    });
    console.log(allPosts[0]);
    filteredPosts = allPosts;
    $(document).ready(function() {
      loadPage(1);
      $('#loading').addClass('hide');
    });
  });

  /* Loads page of data from newData array */
  function loadPage(page) {
    $('.amenities .amenities-entry-wrap').addClass('hide-entry');
    $('#amenities-pagination').empty();
    setTimeout(function() { $('#amenities-entries').empty(); }, 300);
    var items = "";
    var limit = 6;
    var start = (page - 1) * limit;
    var end = start + limit;
    var total = filteredPosts.length;
    for(var i = start; i < end; i++) {
      if(!filteredPosts[i]) continue;
      var bgImg = "background: url('" + filteredPosts[i].image + "')";            
      var item = 
          '<div class="amenities-entry-wrap">'
      + '<div class="amenities-entry">'
      + '<div class="amenities-img amenities-more" data-index="' + i + '" style="' + bgImg + '">'
      + '</div></div></div>';
      items += item;
    }
    if(items.length == 0) {
      items = "<div class='no-results'>No Results Found</div>";
    } else {
      var pages = [];
      if(page - 2 > 0) {
        pages.push({ num: page - 2, isActive: false });
      }
      if(page - 1 > 0) {
        pages.push( { num: page - 1, isActive: false });
      }
      pages.push({ num: page, isActive: true });
      var checkingNext = true;
      var nextIndex = 0;
      while(checkingNext) {
        if(total > end + (limit* nextIndex) && pages.length < 5) {
          pages.push({ num: page + nextIndex + 1, isActive: false });
          nextIndex++;
        } else {
          checkingNext = false;
        }
      }
      if(pages.length < 5) {
        let checkingPrev = true;
        let prevIndex = page - 3;
        while(checkingPrev) {
          if(prevIndex > 0 && pages.length < 5) {
            pages.unshift({ num: prevIndex, isActive: false });
            prevIndex--;
          } else {
            checkingPrev = false;
          }
        }
      }
      var pagi = '';
      if(pages.length > 1) {   
        pagi += '<div class="pagi-numbers">';
        var activePage = pages.find(function(page) {
          return page.isActive;
        });
        if(!pages[0].isActive) {
          pagi += '<span class="pagi-link pagi-arrow" data-page="' + (parseInt(activePage.num)-1) + '"><i class="far fa-chevron-left" aria-hidden="true"></i>&nbsp;&nbsp;Previous Page</span>';
        }        
        pages.forEach(function(p){
          if(p.isActive) {
            pagi += '<span class="pagi-link active" data-page="' + p.num + '">' + p.num + '</span>';
          } else {
            pagi += '<span class="pagi-link" data-page="' + p.num + '">' + p.num + '</span>';
          }
        });        
        if(!pages[pages.length-1].isActive) {
          pagi += '<span class="pagi-link pagi-arrow" data-page="' + (parseInt(activePage.num)+1) + '">Next Page&nbsp;&nbsp;<i class="far fa-chevron-right" aria-hidden="true"></i></span>';
        }
        pagi += "</div>";
      }
    }
    // $('html, body').animate({scrollTop: '0px'}, 500);
    setTimeout(function() { $('#amenities-entries').html(items); $('#amenities-pagination').html(pagi); bindListeners(); }, 300);
    setTimeout(function() { $('.amenities-entry-wrap').addClass('show-entry'); }, 400);
  }

  function bindListeners() {
    var showPopUp = function(index) {
      var post = filteredPosts[index];
      $('.amenities .amenities-pop-left').attr('src', post.image);
      $('.amenities .amenities-pop-title').text(post.title);
      $('.amenities .amenities-pop-desc').html(post.body_text);
      var links = '';
      if(post.learn_more) {
        links += '<a href="' + post.learn_more + '">Learn More&nbsp;&nbsp;<i class="far fa-chevron-right"></i></a>';
      }
      if(post.wtb) {
        links += '<a href="' + post.wtb + '">Where To Buy&nbsp;&nbsp;<i class="far fa-chevron-right"></i></a>';
      }
      $('.amenities .amenities-pop-links').html(links);
      $('.amenities .amenities-pop-cred').html(post.credit);
      $('.amenities .amenities-pop-wrap').addClass('show-amen-pop');
      $('.social-bubbles .fb').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + post.image);
      $('.social-bubbles .tw').attr('href', 'https://twitter.com/intent/tweet?url=' + post.image);
      $('.social-bubbles .pn').attr('href', 'https://pinterest.com/pin/create/button/?url=' + post.image);
      $('.social-bubbles .em').attr('href', 'mailto:?&subject=Blink%20Inspiration%20Gallery&body=' + post.image);
      $('.social-bubbles .ln').attr('href', 'https://www.linkedin.com/shareArticle?mini=true&url=' + post.image);
    }
    $('.amenities .amenities-more').click(function() {
      showPopUp($(this).data('index'));
    });
    $('.amenities .amenities-img').click(function() {
      showPopUp($(this).data('index'));
    });
    $('.amenities .pagi-link').click(function() {
      loadPage($(this).data('page'));
    });
  }
  
  var category = "all"

  function filterPosts() {
    var search = $('#amenities-search').val().toLowerCase();
    filteredPosts = [];
    allPosts.forEach(function(row) {
      if((category == "all" || row.category.indexOf(category) != -1)
        && (search == '' || row.title.toLowerCase().indexOf(search) != -1
           || row.body_text.toLowerCase().indexOf(search) != -1)) {
          filteredPosts.push(row);
      }
    });
    loadPage(1);
  }

  $(document).ready(function() {
    $('#amenities-search-form').submit(function(e) {
      filterPosts();
      e.preventDefault();
    });
    $('.amenities .amenities-pop-close').click(function() {
      $('.amenities-pop-wrap').removeClass('show-amen-pop');
    });
    $('.category').click(function() {
      $('.category').removeClass('active');
      $(this).addClass('active');
      category = $(this).data('category');
      filterPosts();
    });
  });
})();
