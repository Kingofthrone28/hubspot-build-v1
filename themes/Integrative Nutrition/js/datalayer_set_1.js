// window.dataLayer = window.dataLayer || [];

// //Navigation Events Tracker
// function headerNav(element) {
//   var clickText = element.innerText;
//   var clickUrl = '0';
//   window.dataLayer.push({
//     'event': 'header_nav_click',
//     'click_text': clickText,
//     'click_url': clickUrl
//   });
//   console.log("dataLayer Event:", 'header_nav_click', ',', "Click Text:", clickText, ',', "Click URL:", clickUrl);
// }

// const headerNavMenu = document.querySelectorAll('a.jd-nav-item-title');
// if (headerNavMenu != null) {
//   headerNavMenu.forEach(function (link) {
//     link.addEventListener('click', function () {
//       headerNav(link);
//     });
//   });
// }
// function headerNavLogo(element) {
//   var clickText = 'logo';
//   var clickUrl = element.parentElement.href;
//   window.dataLayer.push({
//     'event': 'header_nav_click',
//     'click_text': clickText,
//     'click_url': clickUrl
//   });
//   console.log("dataLayer Event:", 'header_nav_click', ',', "Click Text:", clickText, ',', "Click URL:", clickUrl);
// }
// // Navigation Logo Tracking
// const navLogo = document.querySelectorAll('div.jd-header-main.jd-mobile-hide a img');
// if (navLogo != null) {
//   navLogo.forEach(function (link) {
//     link.addEventListener('click', function () {
//       headerNavLogo(link);
//     });
//   });
// }
// // Navigation Top Container Tracking
// function headerNavTopContainer(element) {
//   var clickText = (element.parentElement.id === "jd-cart" ? "cart" : element.innerText);
//   var clickUrl = (element.href === window.location.href + "#" ? "0" : element.href);
//   window.dataLayer.push({
//     'event': 'header_nav_click',
//     'click_text': clickText,
//     'click_url': clickUrl
//   });
//   console.log("dataLayer Event:", 'header_nav_click', ',', "Click Text:", clickText, ',', "Click URL:", clickUrl);
// }

// const navHeaderTopBar = document.querySelectorAll('div.jd-header-wrap div.jd-header-top.jd-mobile-hide ul li a');
// if (navHeaderTopBar != null) {
//   navHeaderTopBar.forEach(function (link) {
//     link.addEventListener('click', function () {
//       headerNavTopContainer(link);
//     });
//   });
// }
// function headerNavCTA(element) {
//   var clickText = element.innerText;
//   var clickUrl = element.href;
//   window.dataLayer.push({
//     'event': 'header_nav_click',
//     'click_text': clickText,
//     'click_url': clickUrl
//   });
//   console.log("dataLayer Event:", 'header_nav_click', ',', "Click Text:", clickText, ',', "Click URL:", clickUrl);
// }

// // Navigation CTA Tracking
// const navCTA = document.querySelectorAll('div.jd-header-main.jd-mobile-hide a.jd-request-btn.hs-button.light-button.jd-arrow-link');
// if (navCTA != null) {
//   navCTA.forEach(function (link) {
//     link.addEventListener('click', function () {
//       headerNavCTA(link);
//     });
//   });
// }
// //Sub Navigation Events Tracker
// function subNav(element) {
//   var clickText = element.innerText;
//   var clickUrl = element.href;
//   var headerTitle = element.parentElement.parentElement.previousElementSibling.innerText;
//   window.dataLayer.push({
//     'event': 'sub_nav_click',
//     'header_title': headerTitle,
//     'click_text': clickText,
//     'click_url': clickUrl
//   });
//   console.log("dataLayer Event:", 'sub_nav_click', ',', "Header Title:", headerTitle, ',', "Click Text:", clickText, ',', "Click URL:", clickUrl);
// }
// const subLinks = document.querySelectorAll('.jd-dd a');
// if (subLinks != null) {
//   subLinks.forEach(function (subLink) {
//     subLink.addEventListener('click', function () {
//       subNav(subLink);
//     });
//   });
// }

// //Footer Events Tracker
// function footerNav(element) {
//   let clickText = element.innerText;
//   if (element.href.includes('facebook')) {
//     clickText = 'Facebook';
//   } else if (element.href.includes('instagram')) {
//     clickText = 'Instagram';
//   } else if (element.href.includes('linkedin')) {
//     clickText = 'Linkedin';
//   } else if (element.href.includes('youtube')) {
//     clickText = 'YouTube';
//   } else if (element.innerText === "") {
//     clickText = 'logo';
//   } else if (element.innerText.includes('(877) 730-5444')){
//     clickText = 'us number';
//   } else if (element.innerText.includes('+1 (513) 776-0960')){
//     clickText = 'international number';
//   }
//   let clickUrl = element.href;
//   if (clickUrl === 'tel:877-730-5444'){
//     clickUrl = 'us number';
//   } else if (clickUrl === 'tel:1-513-776-0960'){
//     clickUrl = 'international number';
//   }
//   window.dataLayer.push({
//     'event': 'footer_click',
//     'click_text': clickText,
//     'click_url': clickUrl
//   });
//   console.log("dataLayer Event:", 'footer_click', ',', "Click Text:", clickText, ',', "Click URL:", clickUrl);
// }
// const footerNavLinks = document.querySelectorAll('.footer-main a');
// if (footerNavLinks != null) {
//   footerNavLinks.forEach(function (link) {
//     link.addEventListener('click', function () {
//       footerNav(link);
//     });
//   });
// }
// function heroBannerClick(element) {
//   var clickText = element.innerText;
//   var clickUrl = element.href;
//   window.dataLayer.push({
//     'event': 'hero_banner_click',
//     'click_text': clickText,
//     'click_url': clickUrl
//   });
//   console.log("dataLayer Event:", 'hero_banner_click', ',', "Click Text:", clickText, ',', "Click URL:", clickUrl);
// }

// //Hero Banner Click Events Tracker
// const heroBanners = document.querySelectorAll('a.jd-request-btn.hs-button.jd-arrow-link.jd-trans-btn');
// if (heroBanners != null) {
//   heroBanners.forEach(function (button) {
//     button.addEventListener('click', function () {
//       heroBannerClick(button);
//     });
//   });
// }

// function tabClick(element) {
//   var clickText = element.innerText;
//   window.dataLayer.push({
//     'event': 'tab_click',
//     'click_text': clickText
//   });
//   console.log("dataLayer Event:", 'tab_click', ',', "Click Text:", clickText);
// }

// //Tab Click Events Tracker
// const tabClickP1 = document.querySelectorAll('a.tab-item-link');
// if (tabClickP1 != null) {
//   tabClickP1.forEach(function (button) {
//     button.addEventListener('click', function () {
//       tabClick(button);
//     });
//   });
// }
// const tabClickP2 = document.querySelectorAll('div.button-wrapper span.jump-button.jd-request-btn.hs-button.jd-gray-btn');
// if (tabClickP2 != null) {
//   tabClickP2.forEach(function (button) {
//     button.addEventListener('click', function () {
//       tabClick(button);
//     });
//   });
// }
// const tabClickP3 = document.querySelectorAll('div.tab');
// if (tabClickP3 != null) {
//   tabClickP3.forEach(function (button) {
//     button.addEventListener('click', function () {
//       tabClick(button);
//     });
//   });
// }
// function linkClickDLPush(clickText,headerText,clickUrl) {
//   window.dataLayer.push({
//     'event': 'link_click',
//     'click_text': clickText,
//     'header_text': headerText,
//     'click_url': clickUrl
//   });
//   console.log("dataLayer Event:", 'link_click', ',', "Header Text:", headerText, ',', "Click Text:", clickText, ',', "Click URL:", clickUrl);
//   headerText = '';
// }
// // Link Click Events Tracker
// async function linkClickBox(element) {
//   var headerText = element?.parentElement?.previousElementSibling?.previousElementSibling?.querySelector('h4')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickGradSuccess(element) {
//   var headerText = element?.parentElement?.previousElementSibling?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickWithoutHT(element) {
//   var headerText = '';
//   var clickText = element?.innerText;
//   var clickUrl;
//   if (element.href === undefined) {
//     clickUrl = '0';
//   } else clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickOutBox(element) {
//   var headerText = element?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling?.previousElementSibling?.querySelector('h2')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickOutBox2(element) {
//   var headerText = element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.querySelector('h2').innerText;
//   var clickText = element.innerText;
//   var clickUrl = element.href;
//   linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickOutBoxCourse(element) {
//   var headerText = element?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling?.previousElementSibling?.querySelector('h2')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickOutBoxExplore(element) {
//   var headerText = element?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling?.querySelector('h3')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickAboutIIN(element) {
//   var headerText = element?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling?.querySelector('h2')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickExplore(element) {
//   var headerText = element?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling?.querySelector('h2')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickFaculty(element) {
//   var headerText = element?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling?.previousElementSibling?.querySelector('h2')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickGuidance(element) {
//   var headerText = element?.parentElement?.previousElementSibling?.parentElement?.previousElementSibling?.querySelector('h2')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickGuidanceInHealth(element) {
//   var headerText = element?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling?.querySelector('h2')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickLearnMoreHealth(element) {
//   var headerText = element?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling?.querySelector('h4')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickRegisterWebinar(element) {
//   var headerText = element?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling?.querySelector('h2')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickCourseCard(element) {
//   var headerText = element?.querySelector('div.course-card-category')?.innerText;
//   var clickText = element?.querySelector('div.course-card-title')?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickRelatedPosts(element) {
//   var headerText = element?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling?.querySelector('h4')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickUnderTabClick(element) {
//   var headerText = element?.parentElement?.previousElementSibling?.querySelector('.card-subtitle')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.nextElementSibling?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickExploreUnderTabClick(element) {
//   var headerText = element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.previousElementSibling.querySelector('h2').innerText;
//   var clickText = element.innerText;
//   var clickUrl = element.parentElement.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickIINBizMarket(element) {
//   var headerText = element?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.previousElementSibling?.querySelector('h2')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickQuiz(element) {
//   var headerText = element?.parentElement?.parentElement?.firstChild?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.parentElement?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickArticleReadMore(element) {
//   var headerText = element?.parentElement?.previousElementSibling?.previousElementSibling?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// async function linkClickPostReadMore(element) {
//   var headerText = element?.previousElementSibling?.querySelector('h4')?.innerText;
//   var clickText = element?.innerText;
//   var clickUrl = element?.href;
//   headerText !== undefined && linkClickDLPush(clickText,headerText,clickUrl);
// }
// const linkClickP1 = document.querySelectorAll('div.entity-paragraphs-item a');
// if (linkClickP1 != null) {
//   linkClickP1.forEach(function (link) {
//     link.addEventListener('click', function () {
//       linkClickAboutIIN(link).then(linkClickBox(link)).then(linkClickOutBox(link)).then(linkClickIINBizMarket(link)).then(linkClickFaculty(link)).then(linkClickGuidance(link));
//     });
//   });
// }
// const linkClickP2 = document.querySelectorAll('div[style="text-align: center;"] a');
// if (linkClickP2 != null) {
//   linkClickP2.forEach(function (link) {
//     link.addEventListener('click', function () {
//       linkClickOutBoxCourse(link).then(linkClickIINBizMarket(link)).then(linkClickGradSuccess(link));
//     });
//   });
// }
// const linkClickP3 = document.querySelectorAll('span p a');
// if (linkClickP3 != null) {
//   linkClickP3.forEach(function (link) {
//     link.addEventListener('click', function () {
//       linkClickOutBoxExplore(link).then(linkClickRegisterWebinar(link)).then(linkClickLearnMoreHealth(link));
//     });
//   });
// }
// const linkClickP4 = document.querySelectorAll('div.custom-text a.click-processed');
// if (linkClickP4 != null) {
//   linkClickP4.forEach(function (link) {
//     link.addEventListener('click', function () {
//       linkClickWithoutHT(link);
//     });
//   });
// }
// const linkClickP5 = document.querySelectorAll('div.schedule-text a');
// if (linkClickP5 != null) {
//   linkClickP5.forEach(function (link) {
//     link.addEventListener('click', function () {
//       linkClickGuidanceInHealth(link);
//     });
//   });
// }
// const linkClickP6 = document.querySelectorAll('a.course-card');
// if (linkClickP6 != null) {
//   linkClickP6.forEach(function (link) {
//     link.addEventListener('click', function () {
//       linkClickCourseCard(link);
//     });
//   });
// }
// const linkClickP7 = document.querySelectorAll('h5 span[style="color: #2D3841;"]');
// if (linkClickP7 != null) {
//   linkClickP7.forEach(function (link) {
//     link.addEventListener('click', function () {
//       linkClickUnderTabClick(link);
//     });
//   });
// }
// const linkClickP8 = document.querySelectorAll('div.d-none.d-lg-block a span[style="color: #2d3841; font-weight: 600;"]');
// if (linkClickP8 != null) {
//   linkClickP8.forEach(function (link) {
//     link.addEventListener('click', function () {
//       linkClickExploreUnderTabClick(link);
//     });
//   });
// }
// const linkClickP9 = document.querySelectorAll('a span[style="background-color: transparent;"]');
// if (linkClickP9 != null) {
//   linkClickP9.forEach(function (link) {
//     link.addEventListener('click', function () {
//       linkClickExplore(link).then(linkClickQuiz(link));
//     });
//   });
// }
// const linkClickP10 = document.querySelectorAll('span div a');
// if (linkClickP10 != null) {
//   linkClickP10.forEach(function (link) {
//     link.addEventListener('click', function () {
//       linkClickRegisterWebinar(link);
//     });
//   });
// }
// const linkClickP11 = document.querySelectorAll('.jump-button.hs-button');
// if (linkClickP11 != null) {
//   linkClickP11.forEach(function(link) {
//     link.addEventListener('click', function () {
//       linkClickWithoutHT(link);
//     });
//   });
// }
// const linkClickP12 = document.querySelectorAll('.arrow-link.hs-button');
// if (linkClickP12 != null) {
//   linkClickP12.forEach(function (link) {
//     link.addEventListener('click', function () {
//       linkClickWithoutHT(link);
//     });
//   });
// }
// const linkClickP13 = document.querySelectorAll('.jd-request-btn-inverse');
// if (linkClickP13 != null) {
//   linkClickP13.forEach(function (link) {link.addEventListener('click', function () {linkClickWithoutHT(link);  });});
// }
// const linkClickP14 = document.querySelectorAll('a.jd-request-btn.hs-button[id^="module"]');
// if (linkClickP14 != null) {
//   linkClickP14.forEach(function (link) {link.addEventListener('click', function () {linkClickWithoutHT(link);  });});
// }
// const linkClickP15 = document.querySelectorAll('a.iin-btn.click-processed');
// if (linkClickP15 != null) {
//   linkClickP15.forEach(function (link) {
//     link.addEventListener('click', function () {
//       linkClickRelatedPosts(link);
//     });
//   });
// }
// const linkClickP16 = document.querySelector('.jd-blog-listing');
// if (linkClickP16) {
//   linkClickP16.addEventListener('click', function(event) {
//     const articleTitle = event.target.closest('h3 a.jd-post-name');
//     if (articleTitle) {
//        linkClickWithoutHT(articleTitle);
//       }
//     const articleReadMore = event.target.closest('div.jd-listing-read-more a');
//     if (articleReadMore) {
//        linkClickArticleReadMore(articleReadMore);
//     }
//   });
// }
// const linkClickP17 = document.querySelector('.mp-posts.post-listing');
// if (linkClickP17) {
//   linkClickP17.addEventListener('click', function(event) {
//     const postTitle = event.target.closest('div.mb-resource div.content a');
//     if (postTitle) {
//        linkClickWithoutHT(postTitle);
//       }
//     const postReadMore = event.target.closest('a.more-link');
//     if (postReadMore) {
//        linkClickPostReadMore(postReadMore);
//     }
//   });
// }
// // Hamburger Click Event Tracker
// const hamburger_open = document.querySelectorAll('div.jd-ham')[1];
// if (hamburger_open != null) {
//   hamburger_open.addEventListener('click', function () {
//     window.dataLayer.push({
//       'event': 'hamburger_click',
//       'action': 'open'
//     });
//     console.log('dataLayer Event:', 'hamburger_click', ',', 'Action:', 'Open');
//   });
// }
// const hamburger_close = document.querySelectorAll('.jd-ham')[0];
// if (hamburger_close != null) {
//   hamburger_close.addEventListener('click', function () {
//     window.dataLayer.push({
//       'event': 'hamburger_click',
//       'action': 'close'
//     });
//     console.log('dataLayer Event:', 'hamburger_click', ',', 'Action:', 'Close');
//   });
// }
// //Breadcrumb Click Event Teacking
// function breadCrumb(element) {
//   var clickText = (element.innerText === "" ? "Home" : element.innerText);
//   var clickUrl = element.href;
//   window.dataLayer.push({
//     'event': 'breadcrumb_click',
//     'click_text': clickText,
//     'click_url': clickUrl
//   });
//   console.log("dataLayer Event:", 'breadcrumb_click', ',', "Click Text:", clickText, ',', "Click URL:", clickUrl);
// }

// const breadCrumbs = document.querySelectorAll('div.jd-blog-nav a');
// if (breadCrumbs != null) {
//   breadCrumbs.forEach(function (bread) {
//     bread.addEventListener('click', function () {
//       breadCrumb(bread);
//     });
//   });
// }
