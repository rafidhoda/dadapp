import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js"
import { getDatabase,
         ref,
         push,
         onValue,
         update,
         set,
         remove } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js"
import { getAuth,
         signOut,
         onAuthStateChanged,
         GoogleAuthProvider,
         signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js"

const firebaseConfig = {
    apiKey: "AIzaSyDyr7ZX1PiBp1sgS_NPUDsYLSG_jJENUvs",
    databaseURL: "https://dad-app-5ddff-default-rtdb.europe-west1.firebasedatabase.app/",
    authDomain: "dad-app-5ddff.firebaseapp.com"
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

const questionInput = document.getElementById("question-input")
const addQuestionButton = document.getElementById("add-question-button")

const questionsDiv = document.getElementById("questions")

const viewLoggedIn = document.getElementById("view-logged-in")
const viewLoggedOut = document.getElementById("view-logged-out")

const googleButton = document.getElementById("google-button")
const signOutButton = document.getElementById("sign-out-button")

const body = document.body


signOutButton.onclick = () => {
    signOut(auth)
}

googleButton.onclick = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Signed in with Google")
        }).catch((error) => {
            console.error(error.message)
        })
}

addQuestionButton.onclick = () => {
    const referenceInDB = ref(database, `${auth.currentUser.uid}/questions`)
    
    const questionValue = questionInput.value

    if (questionValue) {
        const questionObject = {
            body: questionValue,
            isQuestionAsked: false,
            isQuestionPrivate: true
        }
    
        push(referenceInDB, questionObject)
    
        questionInput.value = ""
    } else {
        console.log("Please enter a value")
        questionInput.style.backgroundColor = "#b32e65"
    }

    
}

function fetchAllQuestions() {
    const referenceInDB = ref(database, `${auth.currentUser.uid}/questions`)
    
    onValue(referenceInDB, (snapshot) => {
        if (snapshot.exists()) {
            let questions = Object.entries(snapshot.val())

            renderAppMode(questions)
        }
    })
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        showLoggedInView()
        fetchAllQuestions()
    } else { 
        showLoggedOutView() 
    }
})


function renderAppMode(arrayOfThings) {

    questionsDiv.innerHTML = ""
    
    for (let i = 0; i < arrayOfThings.length; i++) {
        let questionContainer = document.createElement("div")

        questionContainer.classList.add("question-container")
        
        let questionDiv = document.createElement("div")

        questionDiv.classList.add("question")

        questionDiv.innerText = arrayOfThings[i][1].body

        let isQuestionAsked = arrayOfThings[i][1].isQuestionAsked

        if (isQuestionAsked) {
            questionDiv.classList.add("selected")
        }

        questionDiv.onclick = () => {
            if (!isQuestionAsked) {
                update(ref(database, `${auth.currentUser.uid}/questions/${arrayOfThings[i][0]}`), {
                    isQuestionAsked: true,
                  })
            } else {
                update(ref(database, `${auth.currentUser.uid}/questions/${arrayOfThings[i][0]}`), {
                    isQuestionAsked: false,
                  })
            }

            questionDiv.classList.toggle("selected")
        }

        let deleteButton = document.createElement("button")

        deleteButton.classList.add("delete-button")

        deleteButton.innerText = "❌"

        deleteButton.onclick = () => {
            console.log("delete button clicked")
            remove(ref(database, `${auth.currentUser.uid}/questions/${arrayOfThings[i][0]}`))

            questionContainer.remove()
            
        }

        questionContainer.appendChild(questionDiv)
        questionContainer.appendChild(deleteButton)
        questionsDiv.appendChild(questionContainer)
    }
}

function showLoggedOutView() {
    hideView(viewLoggedIn)
    showView(viewLoggedOut)
}

function showLoggedInView() {
    hideView(viewLoggedOut)
    showView(viewLoggedIn)
}

function showView(view) {
    view.style.display = "flex" 
}

function hideView(view) {
    view.style.display = "none"
}