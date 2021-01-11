'use strict';

let imgsObjects = []; // Holds objects for each uploaded image.
let totalLikes = 0;
let activeAlbum = null;

/**
 * Object for user uploaded images.
 * Holds information about the image such as name, last modified date and the igm description.
 */
class ImgObject {
  constructor(name, imgUrl, unix, date, description) {
    this.imgUrl = imgUrl;
    this.unix = unix;
    this.date = date;
    this.description = description;
    this.name = name;
    this.album = ['All'];
  }
}

/**
 * Eventlistener for html element input file.
 * Listens for changes, i.e when we load a new file.
 * Creates a html img element and sets file objectUrl (blob) as the src.
 * Adds the img element to array and creates
 */
window.addEventListener('load', function () {
  document
    .querySelector('input[type="file"]')
    .addEventListener('change', function () {
      if (this.files && this.files[0]) {
        const imgSrc = URL.createObjectURL(this.files[0]); // Get img src as blob url

        const galleryItem = createGalleryItem(imgSrc);

        const usrText = ''; // Default img description.

        // Create new ImgObject and sotre it in imgsObjects array.
        imgsObjects.push(
          new ImgObject(
            this.files[0].name,
            imgSrc,
            this.files[0].lastModified,
            this.files[0].lastModifiedDate,
            usrText
          )
        );

        const gallery = document.getElementById('gallery');
        gallery.appendChild(galleryItem);
        gallery.scrollIntoView();
      }
    });
});

// Eventlisteners

/**
 * Event listener for sort button. Sorts images conatined in imgsObjects and displays them in new order on screen.
 * @type {html-element} sortButton - Html Button with id sortButton.
 */
(function () {
  const sortButton = document.getElementById('sort');
  sortButton.addEventListener('click', () => {
    if (activeAlbum === null) {
      setActiveAlbum('All');
    }

    if (imgsObjects && imgsObjects.length > 1) {
      sortButton.classList.toggle('rev');
      if (sortButton.className == 'iconButtons rev') {
        imgsObjects.sort((a, b) => (a.unix < b.unix ? 1 : -1));
      } else {
        imgsObjects.sort((a, b) => (a.unix > b.unix ? 1 : -1));
      }

      displayImages();
    }
  });
})();

function displayImages() {
  // Remove Gallery Items
  const galleryItems = Array.from(
    document.getElementsByClassName('gallery-item')
  );
  galleryItems.map((item) => {
    item.remove();
  });
  const gallery = document.getElementById('gallery');

  imgsObjects.map((object) => {
    for (const item of object.album) {
      if (item === activeAlbum) {
        const galleryItem = createGalleryItem(object.imgUrl);
        gallery.appendChild(galleryItem);
        gallery.scrollIntoView();

        // Check if image was liked and set likedButton to true or whatever =)
      }
    }
  });
}

//Handle for albums
(function () {
  document.getElementById('add-album').addEventListener('click', () => {
    const albumName = prompt('Name your album');
    if (albumName) {
      const navList = document.getElementById('nav-list');
      const navItem = document.createElement('li');
      navItem.setAttribute('id', albumName);
      navItem.setAttribute('class', 'nav-item');
      const itemButton = document.createElement('a');
      // itemLink.setAttribute('href', '#');
      itemButton.textContent = albumName;
      setAlbumBtn(itemButton);

      navItem.append(itemButton);
      navList.appendChild(navItem);
    }
  });
})();

setAlbumBtn(document.getElementById('All')); // Add eventlistener to default album "All".

function setAlbumBtn(btn) {
  btn.addEventListener('click', () => {
    setActiveAlbum(btn.textContent);
    displayImages();
  });
}

function getObjectIndex(src) {
  return imgsObjects.findIndex(({ imgUrl }) => {
    return imgUrl === src;
  });
}

// Eventlistener for add descripton btn.
function imgAddDescription(btn) {
  btn.addEventListener('click', (event) => {
    const usrDescription = prompt('Enter a description about the image');

    const imgIndex = getObjectIndex(
      event.target.parentElement.parentElement.parentElement.getElementsByTagName(
        'img'
      )[0].src
    );
    if (usrDescription !== null && usrDescription !== '') {
      imgsObjects[imgIndex].description = usrDescription;
    }
  });
}

function imgDelete(btn) {
  btn.addEventListener('click', (event) => {
    const galleryItem = event.target.parentElement.parentElement.parentElement;
    const imgIndex = getObjectIndex(
      event.target.parentElement.parentElement.parentElement.getElementsByTagName(
        'img'
      )[0].src
    );

    // Check if image is "Liked". Remove Like and update heartCounter if it is.
    if (imgsObjects[imgIndex].album.includes('Liked')) {
      totalLikes--;
      document.getElementById('heartCounter').innerHTML = totalLikes;
    }

    URL.revokeObjectURL(imgsObjects[imgIndex].imgUrl);
    imgsObjects.splice(imgIndex, 1);
    galleryItem.remove();
  });
}

function imgLike(btn) {
  let isLiked = false;
  btn.addEventListener('click', (event) => {
    isLiked = !isLiked;
    const objIndex = getObjectIndex(
      event.target.parentElement.parentElement.parentElement.getElementsByTagName(
        'img'
      )[0].src
    );
    if (isLiked) {
      totalLikes++;
      imgsObjects[objIndex].album.push('Liked');
    } else {
      totalLikes--;
      const index = imgsObjects[objIndex].album.indexOf('Liked');
      if (index > -1) {
        imgsObjects[objIndex].album.splice(index, 1);
      }
    }
    document.getElementById('heartCounter').innerHTML = totalLikes;
    btn.classList.toggle('heartStyle');
  });
}

function setActiveAlbum(albumName) {
  activeAlbum = albumName;
}

function imgEnlarge(elementBtn, srcImg) {
  let modelImg = document.getElementById('modalImg');
  let modelBackground = document.getElementById('myModal');
  elementBtn.addEventListener('click', () => {
    modelBackground.style.display = 'block';
    modelImg.src = srcImg;

    const objIndex = getObjectIndex(srcImg);
    document.getElementById('descriptionId').textContent =
      imgsObjects[objIndex].description;
  });
}

document.getElementById('heartCounter').addEventListener('click', () => {
  setActiveAlbum('Liked');
  displayImages();
});

function imgClose() {
  let closeButton = document.getElementById('closeId');
  let modelBackground = document.getElementById('myModal');
  closeButton.addEventListener('click', () => {
    modelBackground.style.display = 'none';
    document.getElementById('modalImg').src = '';
    document.getElementById('descriptionId').innerHTML = '';
  });
}

//Eventlisteners End

// Create Gallery Item and all its children.
function createGalleryItem(imgSrc) {
  //Create div with class of gallery-item.
  const galleryItem = document.createElement('div');
  galleryItem.setAttribute('class', 'gallery-item');

  // Create img element and set src as imgSrc
  const imgElement = document.createElement('img');
  imgElement.src = imgSrc;
  galleryItem.appendChild(imgElement);

  const buttonBox = document.createElement('div');
  buttonBox.setAttribute('class', 'buttonBox');
  galleryItem.appendChild(buttonBox);

  //------------------------------------------------------------------------
  // Creating dropdown menu for albums in gallery-item.
  const addToAlbumDiv = document.createElement('div');
  addToAlbumDiv.setAttribute('class', 'dropdown');
  const addToAlbumIcon = document.createElement('a');
  addToAlbumIcon.setAttribute('class', 'fas fa-plus dropdown-btn');
  addToAlbumDiv.appendChild(addToAlbumIcon);

  const dropDownContent = document.createElement('div');
  dropDownContent.setAttribute('class', 'dropdown-content');
  addToAlbumDiv.appendChild(dropDownContent);

  addToAlbumIcon.addEventListener('click', () => {
    const albums = Array.from(
      document.getElementById('nav-list').getElementsByTagName('a')
    );
    albums.splice(0, 1);

    const dropDownContentAnchors = Array.from(
      dropDownContent.getElementsByTagName('a')
    );
    if (albums.length > 0) {
      dropDownContent.classList.toggle('show');
      if (dropDownContent.className != 'dropdown-content') {
        for (let i = 0; i < albums.length; i++) {
          if (
            !dropDownContentAnchors[i] ||
            dropDownContentAnchors[i].textContent != albums[i].textContent
          ) {
            const dropDownItem = document.createElement('a');
            dropDownItem.textContent = albums[i].textContent;
            dropDownContent.appendChild(dropDownItem);
            dropDownItem.addEventListener('click', (event) => {
              const objIndex = getObjectIndex(
                event.target
                  .closest('.gallery-item')
                  .getElementsByTagName('img')[0].src
              );
              dropDownContent.classList.toggle('show');
              if (
                !imgsObjects[objIndex].album.includes(dropDownItem.textContent)
              ) {
                imgsObjects[objIndex].album.push(dropDownItem.textContent);
              }
            });
          }
        }
      }
    }
  });

  buttonBox.appendChild(addToAlbumDiv);
  // ---------------------------------------------------------------------

  //Create button for adding description to the img.
  //Give it class name of 'add-description-btn'.
  const addDescriptionBtn = createIcon(
    '<i class="far fa-comment"></i>',
    'add-description-btn'
  );
  imgAddDescription(addDescriptionBtn);

  const deleteBtn = createIcon(
    '<i class="far fa-trash-alt"></i>',
    'delete-img'
  );
  imgDelete(deleteBtn);

  const likeButton = createIcon('<i class="far fa-heart"></i>', 'like');
  imgLike(likeButton);

  function createIcon(icon, idName) {
    const element = document.createElement('a');
    element.innerHTML = icon;
    element.classList.add('imgButton');
    element.setAttribute('id', idName);
    buttonBox.appendChild(element);

    return element;
  }

  imgEnlarge(imgElement, imgElement.src);
  imgClose();

  return galleryItem;
}
