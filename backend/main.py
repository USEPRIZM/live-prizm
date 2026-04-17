from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI(title="Prizm Backend API")

# Allow Next.js on localhost:3000 to interact with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str

@app.post("/api/generate-strategy")
async def generate_strategy(request: PromptRequest):
    prompt = request.prompt.lower()
    blocks = []
    
    # "Smart Mock" Parser for MVP
    if "rsi" in prompt:
        blocks.append({"type": "RSI", "label": "> 70"})
    if "macd" in prompt:
        blocks.append({"type": "MACD", "label": "Cross"})
    if "volume" in prompt or "vol" in prompt:
        blocks.append({"type": "Volume", "label": "Spike"})
    if "moving average" in prompt or "ma" in prompt:
        blocks.append({"type": "MA(50)", "label": "Cross Up"})
    if "stop" in prompt:
        blocks.append({"type": "Trailing Stop", "label": "Active"})
        
    # If no keywords matched, return a default instruction block
    if not blocks:
        blocks = [
            {"type": "Unrecognized", "label": "Try 'RSI' or 'Volume'"}
        ]
        
    return {
        "status": "success", 
        "strategy_id": f"strat_{random.randint(1000, 9999)}", 
        "blocks": blocks
    }

if __name__ == "__main__":
    import uvicorn
    # Make sure to run this via standard module execution if running manually
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
