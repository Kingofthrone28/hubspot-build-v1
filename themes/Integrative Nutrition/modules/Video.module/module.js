const oembedContainers = document.getElementsByClassName('oembed_container');
const embedContainers = document.getElementsByClassName('embed_container');

function loadOEmbed(container) {
  const embedContainer = container;
  const iframeWrapper = embedContainer.querySelector('.iframe_wrapper');
  const customThumbnail = embedContainer.querySelector(
    '.oembed_custom-thumbnail',
  );
  const url = iframeWrapper.dataset.embedUrl;
  const iframeModal = document.querySelector('.video-modal');
  const iframeModalOverlay = document.querySelectorAll(
    '.video-modal .modal-overlay',
  );
  const modalDialog = document.querySelector('.video-modal .modal-dialog');
  const modalDialogClose = document.querySelectorAll(
    '.video-modal .modal-dialog .modal-close',
  );

  if (url) {
    const request = new XMLHttpRequest();
    const requestUrl = `/_hcms/oembed?url=${url}&autoplay=0`;

    request.open('GET', requestUrl, true);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        const data = JSON.parse(request.responseText);

        const maxHeight =
          iframeWrapper.dataset.maxHeight !== undefined &&
          !iframeWrapper.dataset.maxHeight
            ? data.height
            : iframeWrapper.dataset.maxHeight;
        const maxWidth =
          iframeWrapper.dataset.maxWidth !== undefined &&
          !iframeWrapper.dataset.maxWidth
            ? data.width
            : iframeWrapper.dataset.maxWidth;
        const height =
          iframeWrapper.dataset.height !== undefined &&
          !iframeWrapper.dataset.height
            ? data.height
            : iframeWrapper.dataset.height;
        const width =
          iframeWrapper.dataset.width !== undefined &&
          !iframeWrapper.dataset.width
            ? data.width
            : iframeWrapper.dataset.width;

        const el = document.createElement('div');
        el.innerHTML = data.html;
        const iframe = el.firstChild;
        iframe.setAttribute('class', 'oembed_container_iframe');
        iframe.setAttribute('title', data.title);

        if (customThumbnail) {
          customThumbnail.onclick = function () {
            iframe.src += '&autoplay=1';
            this.setAttribute('class', 'oembed_custom-thumbnail--hide');
            iframeWrapper.appendChild(iframe);
            this.parentNode.nextElementSibling
              .getElementsByClassName('modal-dialog')[0]
              .appendChild(iframe);
            this.parentNode.nextElementSibling.classList.add('modal-open');
            this.closest('.dnd-column').classList.add('video-open');
          };
        } else {
          iframeWrapper.appendChild(iframe);
        }

        iframeModalOverlay.forEach((item) => {
          item.onclick = function () {
            this.closest('.oembed_modal_container')
              .getElementsByTagName('button')[0]
              .classList.remove('oembed_custom-thumbnail--hide');
            this.closest('.oembed_modal_container')
              .getElementsByTagName('button')[0]
              .classList.add('oembed_custom-thumbnail');
            this.closest('.oembed_modal_container')
              .getElementsByClassName('video-modal')[0]
              .classList.remove('modal-open');
            this.closest('.oembed_modal_container')
              .getElementsByTagName('iframe')[0]
              .remove();
            this.closest('.dnd-column').classList.remove('video-open');
          };
        });

        modalDialogClose.forEach((item) => {
          item.onclick = function () {
            this.closest('.oembed_modal_container')
              .getElementsByTagName('button')[0]
              .classList.remove('oembed_custom-thumbnail--hide');
            this.closest('.oembed_modal_container')
              .getElementsByTagName('button')[0]
              .classList.add('oembed_custom-thumbnail');
            this.closest('.oembed_modal_container')
              .getElementsByClassName('video-modal')[0]
              .classList.remove('modal-open');
            this.closest('.oembed_modal_container')
              .getElementsByTagName('iframe')[0]
              .remove();
            this.closest('.dnd-column').classList.remove('video-open');
          };
        });

        if (maxHeight) {
          const maxHeightStr = `${maxHeight.toString(10)}px`;
          embedContainer.style.maxHeight = maxHeightStr;
          iframe.style.maxHeight = maxHeightStr;
          if (customThumbnail) {
            customThumbnail.style.maxHeight = maxHeightStr;
          }
        }

        if (maxWidth) {
          const maxWidthStr = `${maxWidth.toString(10)}px`;
          embedContainer.style.maxWidth = maxWidthStr;
          iframe.style.maxWidth = maxWidthStr;
          if (customThumbnail) {
            customThumbnail.style.maxWidth = maxWidthStr;
          }
        }

        if (height) {
          const heightStr = `${height.toString(10)}px`;
          embedContainer.style.height = heightStr;
          iframe.style.height = heightStr;
          if (customThumbnail) {
            customThumbnail.style.height = heightStr;
          }
        }

        if (width) {
          const widthStr = `${width.toString(10)}px`;
          embedContainer.style.width = widthStr;
          iframe.style.width = widthStr;
          if (customThumbnail) {
            customThumbnail.style.width = widthStr;
          }
        }
      } else {
        console.error('Server reached, error retrieving results.');
      }
    };
    request.onerror = function () {
      console.error('Could not reach the server.');
    };
    request.send();
  }
}

function loadEmbed(container) {
  const embedContainer = container;
  const iframe = embedContainer.querySelector('.iframe_wrapper iframe');

  const maxHeight = iframe.getAttribute('height');
  const maxWidth = iframe.getAttribute('width');

  if (maxHeight !== null) {
    const heightStr = `${maxHeight.toString(10)}px`;
    embedContainer.style.maxHeight = heightStr;
  } else {
    iframe.style.height = '100%';
  }

  if (maxWidth !== null) {
    const widthStr = `${maxWidth.toString(10)}px`;
    embedContainer.style.maxWidth = widthStr;
  } else {
    iframe.style.width = '100%';
  }
}

if (oembedContainers.length !== 0) {
  Array.prototype.forEach.call(oembedContainers, (el) => {
    loadOEmbed(el);
  });
}

if (embedContainers.length !== 0) {
  Array.prototype.forEach.call(embedContainers, (el) => {
    loadEmbed(el);
  });
}
