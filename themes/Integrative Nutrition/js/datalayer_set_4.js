window.dataLayer = window.dataLayer || [];

function loadYoutubeIframeAPI() {
  const y_api = document.createElement('script');
  y_api.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(y_api);
}
loadYoutubeIframeAPI();
const progressPercentPushed = {
  0: false,
  10: false,
  25: false,
  50: false,
  75: false,
};
function onYouTubeIframeAPIReady() {
  const youtubeIframeElements = document.querySelectorAll(
    'iframe[src*="youtube"]',
  );
  for (let i = 0; i < youtubeIframeElements.length; i++) {
    let videoUrl = youtubeIframeElements[i].src;
    if (videoUrl.includes('?')) {
      videoUrl += '&enablejsapi=1';
      youtubeIframeElements[i].src = videoUrl;
    } else {
      videoUrl += '?enablejsapi=1';
      youtubeIframeElements[i].src = videoUrl;
    }
    new YT.Player(youtubeIframeElements[i], {
      events: {
        onStateChange: onPlayerStateChange,
      },
    });
  }
}
function onPlayerStateChange(event) {
  const player = event.target;
  const videoTitle = player.getVideoData().title;
  if (event.data == YT.PlayerState.PLAYING) {
    setInterval(() => {
      const currentTime = player.getCurrentTime();
      const totalDuration = player.getDuration();
      const progress = (currentTime / totalDuration) * 100;
      if (!progressPercentPushed[0] && progress >= 0) {
        progressPercentPushed[0] = true;
        window.dataLayer.push({
          event: 'video_start',
          video_title: videoTitle,
        });
        console.log(
          'dataLayer Event:',
          'video_start',
          ',',
          'Video Title:',
          videoTitle,
        );
      } else if (!progressPercentPushed[10] && progress >= 10) {
        progressPercentPushed[10] = true;
        videoProgress(videoTitle, 10);
      } else if (!progressPercentPushed[25] && progress >= 25) {
        progressPercentPushed[25] = true;
        videoProgress(videoTitle, 25);
      } else if (!progressPercentPushed[50] && progress >= 50) {
        progressPercentPushed[50] = true;
        videoProgress(videoTitle, 50);
      } else if (!progressPercentPushed[75] && progress >= 75) {
        progressPercentPushed[75] = true;
        videoProgress(videoTitle, 75);
      }
    }, 1000);
  } else if (event.data == YT.PlayerState.ENDED) {
    window.dataLayer.push({
      event: 'video_complete',
      video_title: videoTitle,
    });
    console.log(
      'dataLayer Event:',
      'video_complete',
      ',',
      'Video Title:',
      videoTitle,
    );
  }
}
function videoProgress(videoTitle, percent) {
  window.dataLayer.push({
    event: 'video_progress',
    video_title: videoTitle,
    video_percent: percent,
  });
  console.log(
    'dataLayer Event:',
    'video_progress',
    ',',
    'Video Title:',
    videoTitle,
    ',',
    'Video Percent:',
    percent,
  );
}

const vimeoIframeElements = document.querySelectorAll('iframe[src*="vimeo"]');
vimeoIframeElements.forEach((vimeoIframeElement) => {
  trackVimeoVideo(vimeoIframeElement);
});
function trackVimeoVideo(videoElement) {
  const vimeo_api = document.createElement('script');
  vimeo_api.src = 'https://player.vimeo.com/api/player.js';
  vimeo_api.onload = function () {
    const player = new Vimeo.Player(videoElement);
    player
      .getVideoTitle()
      .then((title) => {
        let start = 0;
        player.on('play', () => {
          if (start === 0) {
            videoStartCompleteEvent('video_start', title);
            start += 1;
          }
        });
        player.on('ended', () => {
          videoStartCompleteEvent('video_complete', title);
        });
        const progressPercent = [10, 25, 50, 75];
        const triggeredPercent = {};
        player.on('timeupdate', (data) => {
          const percent = (data.percent * 100).toFixed(2);
          for (let j = 0; j < progressPercent.length; j++) {
            const eventPercent = progressPercent[j];
            if (percent >= eventPercent && !triggeredPercent[eventPercent]) {
              videoProgressEvent('video_progress', title, eventPercent);
              triggeredPercent[eventPercent] = true;
            }
          }
        });
      })
      .catch((error) => {
        console.error('Error getting video title:', error);
      });
  };
  document.head.appendChild(vimeo_api);
}
function videoStartCompleteEvent(event, title, percent) {
  window.dataLayer.push({
    event,
    video_title: title,
  });
  console.log('dataLayer Event:', event, ',', 'Video Title:', title);
}
function videoProgressEvent(event, title, percent) {
  window.dataLayer.push({
    event,
    video_title: title,
    video_percent: percent,
  });
  console.log(
    'dataLayer Event:',
    event,
    ',',
    'Video Title:',
    title,
    ',',
    'Video Percent:',
    percent,
  );
}
