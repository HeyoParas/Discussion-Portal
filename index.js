let arr = [];
let obj = {};
let responseobj = {};

let currentQuestionId = 0;
winLoad();
function winLoad() {
  window.addEventListener("load", loadQuestionFromLocalStorage);
}

let newQuestionBtn = document.querySelector("#new-question-form-button");
let questionInputBox = document.querySelector("#search-question"); 
let subjectInputBox = document.querySelector("#enter-subject");
let questionText = document.querySelector("#question-area");
let submitQuestionBtn = document.querySelector("#question-submit-button");
let questionBank = document.querySelector("#question-bank");
let rightContainer = document.querySelector(".right-container1");
let displayQuestion = document.querySelector("#display-question");
let Page1 = document.querySelector(".right-container1");
let Page2 = document.querySelector(".right-container2");
let responserName = document.querySelector("#responser-name");
let responserComment = document.querySelector("#responser-comment");
let responseBtn = document.querySelector("#response-button");
let responseBank = document.querySelector(".people-response");
let resolveBtn = document.querySelector("#resolve-button");

newQuestionBtn.addEventListener("click", () => {
  Page1.style.display = "block";
  Page2.style.display = "none";
});

// Event listener for the search box
questionInputBox.addEventListener("input", searchQuestions);

// Adding question to the questionBank - left pane
submitQuestionBtn.addEventListener("click", () => {
  if (
    subjectInputBox.value == "" ||
    questionText.value == "" ||
    subjectInputBox.value.trim() == "" ||
    questionText.value.trim() == ""
  ) {
    alert("Enter subject and Question !!");
  } else {
    obj = {
      sub: subjectInputBox.value,
      que: questionText.value,
      id: Date.now(),
      response: [],
    };

    addQuestions(subjectInputBox.value, questionText.value, obj.id);
    arr.push(obj);
    saveQuestionToLocalStorage();
    subjectInputBox.value = "";
    questionText.value = "";
  }
});

// Adding response 
responseBtn.addEventListener("click", () => {
  if (
    responserName.value == "" ||
    responserComment.value == "" ||
    responserName.value.trim() == "" ||
    responserComment.value.trim() == ""
  ) {
    alert("Enter Name and Comment !!");
  } else {
    addResponse(responserName.value, responserComment.value);
  }
});

// Add response for the particular question (name and comment)
function addResponse(name, comment) {
  let responseList = document.createElement("div");
  responseList.setAttribute("class", "response-list");

  let likes = 0;
  let dislikes = 0;

  responseList.innerHTML = `
    <h3>${name}</h3>
    <p>${comment}</p>
    <span id="like" class="like-btn">👍 <span class="like-count">${likes}</span></span>
    <span id="dislike" class="dislike-btn">👎 <span class="dislike-count">${dislikes}</span></span>
    <hr>`;

  responserName.value = "";
  responserComment.value = "";

  responseobj = {
    name: name,
    comment: comment,
    likes: likes,
    dislikes: dislikes,
  };

  // Push response into the corresponding question
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id == currentQuestionId) {
      arr[i].response.push(responseobj);
      break;
    }
  }

  // Add response to DOM
  responseBank.prepend(responseList);

  addLikeDislikeListeners(responseList, responseobj);

  saveQuestionToLocalStorage();
}

// Add question list to QuestionBank in left pane
function addQuestions(subject, question, id) {
  let timeAgo = getTimeAgo(id);
  var questionList = document.createElement("div");
  questionList.setAttribute("class", "ques-list");
  questionList.setAttribute("id", id.toString());
  questionList.innerHTML = `<h1 class='mainHeading'>${subject}</h1>
  <div class='classList'>
  <div id='q'>${question}</div>
  <div>${timeAgo}</div>
  </div>`;

  questionBank.prepend(questionList);
}

// Format time in "seconds/minutes/hours ago" format
function getTimeAgo(timestamp) {
  let seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) {
    return seconds + " seconds ago";
  } else if (seconds < 3600) {
    return Math.floor(seconds / 60) + " minutes ago";
  } else if (seconds < 86400) {
    return Math.floor(seconds / 3600) + " hours ago";
  } else {
    return Math.floor(seconds / 86400) + " days ago";
  }
}

// Display question in the right pane when user clicks on a question
questionBank.addEventListener("click", (event) => {
  responseBank.innerHTML = "";
  displayQuestion.innerHTML = "";
  let queCopy = event.target.closest(".ques-list");
  currentQuestionId = queCopy.id;

  if (queCopy.id) {
    let temp = queCopy.cloneNode(true);
    displayQuestion.appendChild(temp);
    Page1.style.display = "none";
    Page2.style.display = "block";
  }

  for (let i = 0; i < arr.length; i++) {
    if (currentQuestionId == arr[i].id) {
      let response = arr[i].response;
      loadResponseFromLocalStorage(response);
      break;
    }
  }
});

function saveQuestionToLocalStorage() {
  localStorage.setItem("questions", JSON.stringify(arr));
}

function loadQuestionFromLocalStorage() {
  arr = JSON.parse(localStorage.getItem("questions")) || [];
  arr.forEach(function ({ sub, que, id }) {
    addQuestions(sub, que, id);
  });
}

function loadResponseFromLocalStorage(response) {
  response.sort((a, b) => {
    if (b.likes === a.likes) {
      return a.dislikes - b.dislikes;
    }
    return b.likes - a.likes;
  });

  response.forEach(({ name, comment, likes, dislikes }) => {
    let responseList = loadResponse(name, comment, likes, dislikes);
    responseBank.appendChild(responseList);
  });
}

function addLikeDislikeListeners(responseList, responseObj) {
  let likeBtn = responseList.querySelector(".like-btn");
  let dislikeBtn = responseList.querySelector(".dislike-btn");
  let likeCount = responseList.querySelector(".like-count");
  let dislikeCount = responseList.querySelector(".dislike-count");

  likeBtn.addEventListener("click", () => {
    responseObj.likes++;
    likeCount.textContent = responseObj.likes;
    updateResponse(responseObj);
    loadResponsesForCurrentQuestion();
  });

  dislikeBtn.addEventListener("click", () => {
    responseObj.dislikes++;
    dislikeCount.textContent = responseObj.dislikes;
    updateResponse(responseObj);
    loadResponsesForCurrentQuestion();
  });
}

function updateResponse(updatedResponse) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id == currentQuestionId) {
      for (let j = 0; j < arr[i].response.length; j++) {
        if (
          arr[i].response[j].name === updatedResponse.name &&
          arr[i].response[j].comment === updatedResponse.comment
        ) {
          arr[i].response[j] = updatedResponse;
          break;
        }
      }
      break;
    }
  }

  saveQuestionToLocalStorage();
}

function loadResponse(name, comment, likes = 0, dislikes = 0) {
  let responseList = document.createElement("div");
  responseList.setAttribute("class", "response-list");

  responseList.innerHTML = `
    <h3>${name}</h3>
    <p>${comment}</p>
    <span id="like" class="like-btn">👍 <span class="like-count">${likes}</span></span>
    <span id="dislike" class="dislike-btn">👎 <span class="dislike-count">${dislikes}</span></span>
    <hr>`;

  addLikeDislikeListeners(responseList, { name, comment, likes, dislikes });

  return responseList;
}

function loadResponsesForCurrentQuestion() {
  responseBank.innerHTML = "";
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id == currentQuestionId) {
      arr[i].response.sort((a, b) => {
        if (b.likes === a.likes) {
          return a.dislikes - b.dislikes;
        }
        return b.likes - a.likes;
      });
      loadResponseFromLocalStorage(arr[i].response);
      break;
    }
  }
}

// Function to search and filter questions in the question bank
function searchQuestions() {
  let searchQuery = questionInputBox.value.toLowerCase().trim();

  questionBank.innerHTML = "";

  // If searchQuery is empty, display all questions, otherwise filter
  if (searchQuery === "") {
    arr.forEach(({ sub, que, id }) => addQuestions(sub, que, id));
  } else {
    arr.forEach(({ sub, que, id }) => {
      if (sub.toLowerCase().includes(searchQuery) || que.toLowerCase().includes(searchQuery)) {
        addQuestions(sub, que, id);
      }
    });
  }
}

// Remove from the DOM and local storage
resolveBtn.addEventListener("click", () => {
  if (currentQuestionId) {
    document.getElementById(currentQuestionId).remove();
    displayQuestion.innerHTML = "";

    arr = arr.filter(
      (question) => question.id.toString() !== currentQuestionId
    );
    localStorage.setItem("questions", JSON.stringify(arr));

    Page1.style.display = "block";
    Page2.style.display = "none";
    currentQuestionId = 0;
  }
});
