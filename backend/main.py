from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.coding_agent import coding_agent, analyze_code, fix_code


app = FastAPI(
    title="AI Coding Agent API",
    description="Backend API for AI-powered code generation, analysis and debugging.",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class CodeRequest(BaseModel):
    prompt: str


@app.get("/")
def root():
    return {
        "message": "AI Coding Agent API is running",
        "status": "online"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "AI Coding Agent API"
    }


@app.post("/generate")
def generate_code(request: CodeRequest):
    try:
        result = coding_agent(request.prompt)

        return {
            "success": True,
            "operation": "generate",
            "response": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini service error: {str(error)}"
        )


@app.post("/analyze")
def analyze(request: CodeRequest):
    try:
        result = analyze_code(request.prompt)

        return {
            "success": True,
            "operation": "analyze",
            "response": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini service error: {str(error)}"
        )


@app.post("/fix")
def fix(request: CodeRequest):
    try:
        result = fix_code(request.prompt)

        return {
            "success": True,
            "operation": "fix",
            "response": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini service error: {str(error)}"
        )