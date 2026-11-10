"use client";
import { useState } from "react";
import { browserDb } from "../../lib/supabase";
type Result = { title: string; summary: string; findings: string[]; advice: string; disclaimer: string };
export default function FraudeBancaire() {
 const [description,setDescription]=useState(""); const [result,setResult]=useState<Result|null>(null);
 const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
 async function analyze(){setLoading(true);setError("");setResult(null);
  try { const {data:{session}}=await browserDb().auth.getSession();
   if(!session?.access_token)throw new Error("Créez un compte gratuit ou connectez-vous avant l'analyse.");
   const res=await fetch("/api/fraude-bancaire",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({description})});
   const data=await res.json();if(!res.ok)throw new Error(data.error||"Analyse impossible.");setResult(data);
  }catch(e){setError(e instanceof Error?e.message:"Erreur inconnue.")}finally{setLoading(false)}
 }
 return <main><section className="hero"><div className="pill">AVERNYX · Protection bancaire</div><h1>Un faux conseiller <em>vous a appelé ?</em></h1><p className="lead">Repérez les signaux d'une usurpation de conseiller bancaire. Analyse indicative gratuite, avec compte.</p></section>
 <section className="panel analyzer"><h2>Décrivez l'appel suspect</h2><p className="muted">Ne saisissez aucun nom, numéro de téléphone, IBAN, code reçu par SMS ou mot de passe. Le numéro affiché peut être falsifié.</p>
 <textarea aria-label="Description de l'appel" rows={7} maxLength={4000} placeholder="Exemple : une personne se présente comme mon conseiller et me demande de transférer mon argent sur un compte sécurisé..." value={description} onChange={e=>setDescription(e.target.value)} style={{width:"100%",background:"#071120",border:"1px solid #324867",borderRadius:10,padding:15,color:"white",fontSize:16}} />
 <button onClick={analyze} disabled={loading||description.trim().length<15}>{loading?"Analyse en cours…":"Analyser gratuitement"}</button>
 {error&&<div className="result"><p>{error}</p><a href="/login" className="btn">Se connecter</a></div>}
 {result&&<div className="result" role="status"><h3>{result.title}</h3><p>{result.summary}</p>{result.findings.length>0&&<ul>{result.findings.map((f,i)=><li key={i}>{f}</li>)}</ul>}<p><strong>Que faire ?</strong> {result.advice}</p><p className="muted">{result.disclaimer}</p></div>}
 </section></main>;
}
