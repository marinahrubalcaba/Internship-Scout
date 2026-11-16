import os
import json
import requests
from dotenv import load_dotenv
from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS

# load api keys from .env 
load_dotenv()

# initlialize Flask
app = Flask(__name__)
CORS(app)

# initialize NRP API client and set model
api_key = os.environ.get("NRP_API_KEY", "")
client = OpenAI(
    api_key=api_key,
    base_url="https://ellm.nrp-nautilus.io/v1"
)
nrp_model = "gpt-oss"

#function to clean the raw JSON input
def clean_json(raw_json):
    raw_json = (raw_json or "").strip()
    if raw_json.startswith("```"):
        raw_json = raw_json.strip("`")
        if raw_json.startswith("json"):
            raw_json = raw_json[4:].strip()
    return json.loads(raw_json)

#first prompt to generate 3 internship job titles based on the user's major and interests
def generate_jobs(major, interests):
    system_prompt = (
        "You are an internship scout finding internship job titles for a student.\n"
        "Generate a list of internship job titles based on the student's major and interests.\n"
        "Output the job titles in raw JSON ONLY."
        "Use ONLY the format: [\"job title 1\", \"job title 2\", \"job title 3\"]"
    )

    user_prompt = (
        f"Student majoring in {major} with interests in {', '.join(interests)}." 
        f"Generate 3 internship job titles that align with the student's major and interests."
    )

    response = client.chat.completions.create(
        model=nrp_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.0,
    )

    jobs = clean_json(response.choices[0].message.content)
    return jobs

# Get internship postings from SerpAPI using the job titles from the first AI prompt.
def fetch_internships(job_titles):
    serpapi_key = os.getenv("SERPAPI_API_KEY")
    if not serpapi_key:
        raise RuntimeError("SERPAPI_API_KEY is missing from .env.")

    internships = []

    for job_title in job_titles:
        try:
            response = requests.get(
                "https://serpapi.com/search.json",
                params={
                    "engine": "google_jobs",
                    "q": job_title,
                    "api_key": serpapi_key,
                },
                timeout=30,
            )
        except requests.RequestException:
            raise RuntimeError("Could not connect to SerpAPI.") from None

        if response.status_code != 200:
            raise RuntimeError(
                f"SerpAPI search failed with status {response.status_code}."
            )

        for job in response.json().get("jobs_results", []):
            apply_options = job.get("apply_options") or []
            link = apply_options[0].get("link") if apply_options else None

            internships.append({
                "id": len(internships) + 1,
                "title": job.get("title", ""),
                "description": job.get("description", ""),
                "link": link,
            })

    return internships



# second prompt to rank the generated internships based on the user's major and interests
def rank_internships(job_posts, major, interests):
    system_prompt = (
        "You are an internship scout ranking internships for a student.\n"
        "Your task is to rank internships based on their relevance to the student's major and interests.\n"
        "Score each internship from 0 to 100 based on how well it aligns with the student's major and interests.\n"
        "Provide a professional, yet straightforward, summary of the role based on the job description\n"
        "Provide a detailed, personalized explanation of specifically how this role aligns with the student's major and interests. Keep it limited to 1-2 sentences. Avoid generalizing.\n"
        "Output the rankings in raw JSON ONLY. No additional text. The format is:\n"
        "[\n"
        "  {\"id\": 1, \"score\": 85,\"summary\": \"up to max 150 words overview...\", \"explanation\": \"relevant to major and interests because the day to day duties align with...\"}\n"
        "]"
    )

    user_prompt = (
        f"Student majoring in {major} with interests in {', '.join(interests)}."
        f"Rank the following internships based on their relevance to the student's major and interests: {json.dumps(job_posts)}"
    )

    response = client.chat.completions.create(
        model=nrp_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.0,
    )
    rankings = clean_json(response.choices[0].message.content)

    # attach the rankings to the original job posts
    rankings_map = {str(item.get("id")): item for item in rankings}
    for job in job_posts:
        matched = rankings_map.get(str(job.get("id")), {})
        job["score"] = int(matched.get("score", 0))
        job["summary"] = matched.get("summary", "No job summary available.")

        if matched.get("summary"):
            job["description"] = matched.get("summary")

        job["explanation"] = matched.get("explanation", "Good match based on your major and interests.")

    job_posts.sort(key=lambda x: x.get("score", 0), reverse=True)
    return job_posts

## INSERT SORTING FUNCTION AND ATTATCH RANKINGS TO INTERNSHIP LISTINGS

# flask endpoint to handle the POST request from the frontend
@app.route("/InternshipScout", methods=["POST"])
def internship_scout():
    data = request.get_json()
    major = data.get("major")
    interests = data.get("interests", [])

    if not major or not interests:
        return jsonify({"error": "Major and interests are required."}), 400

    try:

        # generate intership job titles to search for based on the user's major and interests
        internship_titles = generate_jobs(major, interests)

        # fetch the internships from SERP API based on the generated job titles
        internship_listings = fetch_internships(internship_titles)

        # rank the generated internships
        ranked_results = rank_internships(internship_listings, major, interests)

        return jsonify({
            "search_terms" : {"job_titles": internship_titles}, 
            "results" : ranked_results
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
