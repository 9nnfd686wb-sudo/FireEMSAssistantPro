import {
    loadProtocolAnswers,
    loadProtocolJson
} from "../storage.js";

const answerList=document.getElementById("answerList");
const answerEmpty=document.getElementById("answerEmptyText");

function formatAnswer(question,answer){

    if(question.type==="yesno"){

        return answer ? "はい":"いいえ";

    }

    return answer;

}

async function render(){

    const saved=loadProtocolAnswers();

    if(!saved){

        answerEmpty.hidden=false;

        return;

    }

    const protocol=await loadProtocolJson(saved.protocolId);

    answerList.innerHTML="";

    protocol.questions.forEach(q=>{

        const answer=saved.answers[q.id];

        if(answer===undefined ||
           answer===null ||
           answer===""){

            return;

        }

        answerList.innerHTML+=`

<li class="qa-item">

<span class="question-text">

${q.label}

</span>

<span class="answer-text">

${formatAnswer(q,answer)}

</span>

</li>

`;

    });

}

render();

document
.getElementById("backBtn")
.addEventListener("click",()=>{

    history.back();

});