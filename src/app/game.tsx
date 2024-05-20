"use client"

import Groq from "groq-sdk";
import { useState, useEffect } from "react";
import { generateImageFal, generateImageFalSVD, getGeminiText } from "./ai";
import { aboriginalpdf } from "../data";
import { generateVoice, speechToText } from "@/ai/fal";
import TextToSpeech from "./texttospeech";

const groq = new Groq({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});



////Initial Game States set up here

export default function AlternateTides({ description }: { description: string }) {
  const defaultGameState = {
    year: 1770,
    culturalAssimilation: "Minimal, Aboriginal culture largely intact",
    reconciliation: "Not yet considered, two worlds collide",
    currentPoliticalChallenges: "Colonizers face moral dilemmas",
    warAndConflict: "Potential for conflict looms",
    lossOfIdentityChallenges: "Aboriginal culture threatened by colonization",
    event: "Captain Cook and his crew arrive at Sydney Harbor aboard the HMS Endeavour. The Eora Nation people, adorned with intricate traditional body paint and carvings, watch warily from the shore. The Europeans, dressed in their pristine naval uniforms, unload gifts including tools, food, and fabrics. They set up a temporary encampment with tents and cooking fires. The Eora people, engaging in daily activities like fishing, cooking, and crafting tools, eye the newcomers with a mix of curiosity and suspicion. Children play near the shore, while warriors stand ready, prepared for any threat. In a central area, Cook presents an array of gifts to Eora leaders, who examine them cautiously, discussing their potential uses and implications. Friendly gestures and respectful bows are exchanged, but tension is palpable. Some Europeans document the local flora and fauna, fascinated yet uncertain. The Eora people’s reaction is mixed, some intrigued by the strange tools, others wary of the Europeans’ intentions. The atmosphere is charged, the future of this encounter hanging in the balance.",
    actions: [
      "Captain Cook and his crew present an array of gifts, including tools, food, and fabrics, as a gesture of goodwill.",
      "The Europeans formally request permission from the Eora leaders to use a portion of the land for their encampment and scientific activities.",
      "The Europeans use weapons to intimidate the Eora people, attempting to force them to leave the area and secure the land for themselves.",
      "The Europeans choose to stay on their ship, observing the Eora people and waiting for a clear sign or permission to use the land."
    ],
    selectedAction: "",
    history: [],
    conclusion: ""

  };

  const [game, setGame] = useState(defaultGameState);
  const [img, setImg] = useState("");
  const [fetching, setFetching] = useState(false);
  const [conclusionFetching, setConclusionFetching] = useState(false);
  const [analysis, setAnalysis] = useState<{ [key: string]: string }>({});
  const [gameDone, setGameDone] = useState(false);
  const [videosFalUrl, setVideoFalUrl] = useState();
  const [speech, setSpeech] = useState(); 

  const generateImage = async (imageDescription: string) => {
    setFetching(true);
    try {
      const response = await generateImageFal(imageDescription);
      const imageUrl = response;
      setImg(imageUrl);
      setFetching(false);
    } catch (error) {
      console.error("Error generating image:", error);
      setFetching(false);
    }
  };



  ///So here is the Image Prompts, prompts for consistant style of visualization
  
  useEffect(() => {
    // const interval = setInterval(() => {
    const imageDescription = `
    Generate a detailed and realistic image representing the state of Aboriginal culture and society in Australia during the year ${game.year}. 
    Show the influence of European contact and the effects of the decisions made in the game. 
    Highlight the unique aspects of Aboriginal art, architecture, and way of life. 
    Depict the level of cultural preservation and the interactions between Aboriginal people and European settlers based on the game state: ${JSON.stringify(game)}, the game event: ${game.event}, and the selected action: ${game.selectedAction}.
    
    **Details to include:**
    - **Setting and Environment:** Depict a realistic street view that combines Eora Nation elements and European influences appropriate to the year ${game.year}. Show native Australian flora such as eucalyptus trees, ferns, and banksias. Include any relevant natural or urban features based on the game state.
    - **Buildings and Structures:** Illustrate the architecture of the period, incorporating traditional Aboriginal shelters like bark huts and woven domes alongside European-style buildings, which evolve over time. Highlight Aboriginal carvings, totems, and murals visible on the structures.
    - **People and Activities:** Show Aboriginal people and European settlers engaging in activities appropriate to the game event. For example, if the event involves trade, depict exchanges of goods; if it involves conflict, show defensive preparations or skirmishes.
    - **Interactions and Exchanges:** Focus on the central interactions between Aboriginal people and Europeans based on the selected action. Show gestures, body language, and communication methods such as interpreters or visual aids.
    - **Cultural and Historical Context:** Highlight elements of Aboriginal art, architecture, and way of life, including clothing, tools, and community activities. Show the Europeans' influence, whether it is respectful exchange, assimilation, or conflict.
    - **Atmosphere and Ambience:** Create a lively and dynamic scene with appropriate lighting and ambience. For example, warm, golden lighting for peaceful interactions, or tense, stark lighting for conflict situations. Include sounds and environmental details to enhance immersion.
  `;
    generateImage(imageDescription);
   
    (async () => {
        const video =  await generateImageFalSVD(imageDescription, img)
        console.log(video)
        setVideoFalUrl(video?.url)
    })()

    // }, 8000);

    // return () => clearInterval(interval);
  }, [game.actions]);

  useEffect(() => {
    setConclusionFetching(true)

    if (game.year >= 1790 && !Boolean(gameDone)) {

      (async () => {
        const testGemini = await getGeminiText(`\
        
          The current game state is:
          {
            "year": ${game.year},
            "culturalAssimilation": "${game.culturalAssimilation}",
            "reconciliation": "${game.reconciliation}",
            "currentPoliticalChallenges": "${game.currentPoliticalChallenges}",
            "warAndConflict": "${game.warAndConflict}",
            "lossOfIdentityChallenges": "${game.lossOfIdentityChallenges}",
            "history":${game.history}
          }
          
          "history" here refers to the player past decisions. And aboriginal knowleged: ${aboriginalpdf}
          Based on the current state of the world and the player's decisions, create a compelling conclusion that assesses the impact of their choices on the following aspects:
          1. The preservation and celebration of Aboriginal culture and heritage
          2. The state of reconciliation between Aboriginal people and the wider Australian society
          3. The political landscape and the challenges faced by the nation
          4. The level of conflict or stability in the new world
          5. The struggles or triumphs of the Aboriginal people in maintaining their identity
    
          Provide a thought-provoking analysis of the player's actions and their consequences, highlighting the key turning points and the lessons that can be learned from their journey. Conclude by reflecting on the enduring spirit of the Aboriginal people and the importance of understanding and compassion in shaping the future of Australia.
    
          Please respond in a single "conclusion" property containing the generated text. only show the content inside json {}, do not include curly brackets: {}. Do not include comments or any other text outside the JSON object.
        
        `);

        setGame(prevState => {
          const newState = {
            ...prevState,
            conclusion: testGemini
          };
          return newState;
        });
        setGameDone(true)
      })()


    }

    setConclusionFetching(false);

  }, [game])


  useEffect(() => {
    const generateAnalysis = async () => {
      const analysisPromises = game.actions.map(async (action) => {
        const analysisPrompt = `Analyze the consequences of selecting the action "${action}" in the current game state: ${JSON.stringify(game, null, 2)} within 80 words.`;
        const MAX_RETRIES = 3;
        let retries = 0;
        let analysisResponse = "";

        while (retries < MAX_RETRIES) {
          try {
            analysisResponse = await ai(analysisPrompt, 512, "", "llama3-8b-8192");
            break;
          } catch (error) {
            console.error(`Error generating analysis for action "${action}":`, error);
            retries++;
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
          }
        }

        if (retries === MAX_RETRIES) {
          console.warn(`Failed to generate analysis for action "${action}" after ${MAX_RETRIES} retries.`);
        }

        return { action, analysis: analysisResponse };
      });

      try {
        const analysisResults = await Promise.all(analysisPromises);
        const updatedAnalysis: { [key: string]: string } = {};
        analysisResults.forEach(({ action, analysis }) => {
          updatedAnalysis[action] = analysis;
        });

        setAnalysis(updatedAnalysis);
      } catch (error) {
        console.error("Error generating analysis:", error);
      }
    };

    generateAnalysis();
  }, [game.actions]);


////decisions prompts


  async function handleClick(buttonText: string) {
    console.log("Clicked");
    const analysisText = analysis[buttonText] || "";

    const systemPrompt = `You are an AI assistant for the historical strategy game Alternate Tides: Australia's New Dawn. Players will experience Australian history from European colonists to modern times through this game. Your task is to interpret a JSON object containing the current game state, the player's suggested actions, and analysis of their consequences.
    When updating the JSON object, consider in detail the impact of player choices on the year, cultural assimilation, reconciliation, current political challenges, war and conflict, and loss of identity challenges. You need to fine-tune these variables to truly reflect the immediate and long-term consequences of your choices.
    Ensure that four options are provided at each decision point. These options should be dynamic, diverse and challenging, and accurately reflect the cultural and historical context of the game setting. These choices will confront players with decisions about the moral dilemmas and practical impacts of colonization, such as land dispossession, cultural erosion, resistance movements, assimilation policies, and the fight for Aboriginal rights and recognition.
    When describing decisions, be specific about the expected impacts on key variables such as cultural assimilation, reconciliation, political challenges, conflicts, and identity issues. This will help players more fully understand the possible consequences of their choices.
    Make sure the JSON object you generate is strictly well-formatted. Use double quotes for property names and string values. Escape any double quotes or backslashes within string values. Do not include comments or any other text outside the JSON object.

    Format the JSON object as follows:
    {
      "year": number,
      "culturalAssimilation": "string",
      "reconciliation": "string",
      "currentPoliticalChallenges": "string",
      "warAndConflict": "string",
      "lossOfIdentityChallenges": "string",
      "actions": [
        "string",
        "string",
        "string",
        "string"
      ],
      "selectedAction": "string"
    }

    

    Progress the year by 3 years each time a decision is made. This simulates long-term effects and developments, aligning with historical contexts and potential alternative outcomes.

    Only output the JSON object with no other text or explanation. JSON OBJECT: {`;

    const userPrompt = `Current game state: ${JSON.stringify(
      game,
      null,
      2
    )}. The user wants to take the action: ${buttonText}. Analysis of the consequences: ${analysisText}`;

    try {
      const gameState = await ai(userPrompt, 3000, systemPrompt, "llama3-70b-8192");


      if (gameState) {
        try {
          const updatedGameState = JSON.parse(gameState);

          const eventPrompt = `Generate a complex game event for the historical strategy game Alternate Tides: Australia's New Dawn based on the current game state and the selected action. The event should be around 100 words and reflect the consequences of the player's choice, introducing new challenges or opportunities. Consider the impact on cultural assimilation, reconciliation, current political challenges, war and conflict, and loss of identity challenges.
       
          The current game state is:
          {
            "year": ${updatedGameState.year},
            "culturalAssimilation": "${updatedGameState.culturalAssimilation}",
            "reconciliation": "${updatedGameState.reconciliation}",
            "currentPoliticalChallenges": "${updatedGameState.currentPoliticalChallenges}",
            "warAndConflict": "${updatedGameState.warAndConflict}",
            "lossOfIdentityChallenges": "${updatedGameState.lossOfIdentityChallenges}",
            "actions": ${JSON.stringify(updatedGameState.actions)},
            "selectedAction": "${buttonText}-${analysisText}"
          }

          Consider about the previous events:${game.history} and the knowledge of  ${aboriginalpdf}

          Generate the game event as a string value for the "event" field. Format the response as follows:
          {
            "event": "string"
          }
         

          Don't render in markdown, give the response as a json

          Only output the JSON object with no other text or explanation. 

          Output in JSON format,
          Do not use markdown.

          JSON:
          
          `;



          const testGemini = await getGeminiText(eventPrompt);

          setGame(prevState => {
            const newState = {
              ...prevState,
              ...updatedGameState,
              event: testGemini,
              actions: updatedGameState.actions || [],
              selectedAction: `${buttonText}-${analysisText}`,
              year: prevState.year + 3,
              history: [...prevState.history, `${buttonText}-${analysisText}`]
            };
            return newState;
          });
        } catch (error) {
          console.error("Failed to parse game state:", error);
        }
      } else {
        console.error("Failed to update game state");
      }
    } catch (error) {
      console.error("Error updating game state:", error);
    }
  }

  async function ai(userPrompt, max_tokens, systemPrompt = "", model = "llama3-70b-8192") {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        model: model,
        max_tokens: max_tokens,
      });

      return completion.choices[0]?.message?.content || "Oops, something went wrong.";
    } catch (error) {
      console.error("Error in AI function:", error);
      throw error;
    }
  }



  return (
    <div className="background w-[999px] mx-auto">

    {/* <audio
      src="https://soundcloud.com/didgeridooaboriginaldreamtime/sets/didgeridoo-with-nature-sounds?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
      autoPlay={true}
      loop={true}
    /> */}

    
      <div className="title">WORLD ENGINE</div>
      <div className="navbar">
        <div>Year: {game.year}</div>
        <div>Cultural Assimilation: {game.culturalAssimilation}</div>
        <div>Reconciliation: {game.reconciliation}</div>
        <div>Current Political Challenges: {game.currentPoliticalChallenges}</div>
        <div>War and Conflict: {game.warAndConflict}</div>
        <div>Loss of Identity Challenges: {game.lossOfIdentityChallenges}</div>
      </div>


      {
        game.year >= 1790 ? <>   <p>
          
          {(img && !videosFalUrl) && <img className="HeroImage" src={img} alt="Generated Image" />}

{videosFalUrl && (<>
  <video className="HeroImage" width="960" height="640" autoPlay loop>
    <source src={videosFalUrl} type="video/mp4"/>
        Your browser does not support the video tag.
        </video>
        <div className="empty_space">
              </div>
            <div className="conclusion-title">Welcome to the New World...</div>
            <div className="conclusion-content">
              <p>
                Through your choices and actions, you have shaped the course of history and created a new world in Australia. The decisions you made have had far-reaching consequences, molding the fabric of society and the lives of countless individuals.
              </p>
              <p>
                In this new world, the Aboriginal culture and knowledge have been {game.culturalAssimilation === "Preserved" ? "preserved and celebrated" : "eroded and marginalized"}. The path of {game.reconciliation} has {game.reconciliation === "Achieved" ? "brought healing and unity" : "left deep scars and divisions"}.
              </p>
              <p>
                The political landscape has been shaped by {game.currentPoliticalChallenges}, leading to {game.warAndConflict === "Avoided" ? "peace and stability" : "conflict and turmoil"}. The Aboriginal people have {game.lossOfIdentityChallenges === "Overcome" ? "maintained their cultural identity" : "struggled to preserve their heritage"}.
              </p>
              <p>
                {conclusionFetching && <p className="ferchingc">Generating game conclusion. please wait for awhile</p>} 
                {game.conclusion}
              </p>
            </div>


      <div className="conclusion-reflection">
                <p>Reflect upon the world you have shaped:</p>
                  <p>How have your choices influenced the lives of the Aboriginal people?</p>
                  <p>What lessons can be learned from the path you have taken?</p>
                  <p>How will the new world you have created continue to evolve?</p> 
              </div>



      <div className="conclusion-message">
                <p>
                  Remember, the world you have created is a testament to the power of your decisions. The legacy of your choices will echo through the generations, shaping the future of Australia and its people.
                </p>
                <p>
                  Thank you for experiencing Alternate Tides: A New Dawn for Australia. May the world you have brought into being serve as a reminder of the importance of understanding, compassion, and the enduring spirit of the Aboriginal people.
                </p>
      </div>
      



    </>)}
          
          
          </p></> : (
          <>
            <div>{game.event}</div>
            <div className="row hero">
              <div className="GameTitleC">Alternate Tides</div>
              <div className="GameTitle">A New Dawn for Australia</div>
              {(img && !videosFalUrl) && <img className="HeroImage" src={img} alt="Generated Image" />}

              {videosFalUrl && (<>
                <video className="HeroImage" width="960" height="640" autoPlay loop>
                  <source src={videosFalUrl} type="video/mp4"/>
                      Your browser does not support the video tag.
                    </video>

                  </>)}
                </div>

                {game.actions.map((action, index) => (
                  <div key={index}>
                    <button onClick={() => handleClick(action.toString())}>
                      {action}
                    </button>
                    <div>{analysis[action.toString()] || 'Loading analysis...'}</div>
                  </div>
                ))}</>
              )
              }



              <div className="empty_space">
              </div>
              <footer className="footer">
                <div className="footer-content">
                  <p>&copy; {new Date().getFullYear()} Alternate Tides. ALL RIGHTS RESERVED.</p>
                  <nav className="footer-nav">
                    <div>WORLD ENGINE STUDIO</div>
                    <div>CHUN HO LAU, YUSHAN WANG, TIMOTHY JINZHI NG</div>
                    <div>RMIT ARCHITECTURE</div>
                  </nav>
                </div>
              </footer>

      {game.event && <TextToSpeech text={game.event} showControls autoPlay/>}

            </div>
            );
}