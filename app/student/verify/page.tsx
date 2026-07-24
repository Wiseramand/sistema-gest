'use client';

import { useState } from 'react';

export default function VerifyCertificatePage() {
    const [id, setId] = useState('');
    const [result, setResult] = useState<any>(null);
    const [scanning, setScanning] = useState(false);

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setScanning(true);
        // Simulator delay
        setTimeout(() => {
            if (id.length > 5) {
                setResult({
                    status: 'valid',
                    certId: id.toUpperCase(),
                    student: 'Aluno Marítimo',
                    course: 'Segurança Básica STCW',
                    issueDate: '12/03/2026',
                    validUntil: '12/03/2031',
                    authority: 'Marítimo Training Center'
                });
            } else {
                setResult({ status: 'invalid' });
            }
            setScanning(false);
        }, 1500);
    };

    return (
        <div className="verify-page container">
            <div className="page-header">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Validador de Certificados</h1>
                    <p>Verifique a autenticidade de certificados marítimos emitidos pelo nosso centro.</p>
                </div>
            </div>

            <div className="verify-layout">
                <div className="verify-card card shadow-sm">
                    <div className="qr-box">
                        <div className="qr-scanner-sim">
                            <div className="scan-line"></div>
                            <span className="qr-icon">📱</span>
                            <p>Aponte a câmara ou insira o código</p>
                        </div>
                    </div>

                    <form onSubmit={handleVerify} className="verify-form">
                        <div className="field">
                            <label>Código do Certificado (ID)</label>
                            <input 
                                type="text" 
                                value={id} 
                                onChange={e => setId(e.target.value)} 
                                placeholder="Ex: MTC-STCW-2026-XXXX"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-verify" disabled={scanning}>
                            {scanning ? 'A Validar...' : 'Verificar Autenticidade'}
                        </button>
                    </form>
                </div>

                <div className="result-area">
                    {result && result.status === 'valid' && (
                        <div className="result-card valid shadow-sm">
                            <div className="res-hdr">
                                <span className="valid-icon">✅</span>
                                <div>
                                    <h3>Certificado Autêntico</h3>
                                    <p>Identificador: {result.certId}</p>
                                </div>
                            </div>
                            <div className="res-body">
                                <div className="res-row"><span>Titular:</span> <strong>{result.student}</strong></div>
                                <div className="res-row"><span>Curso:</span> <strong>{result.course}</strong></div>
                                <div className="res-row"><span>Emissão:</span> <strong>{result.issueDate}</strong></div>
                                <div className="res-row"><span>Validade:</span> <strong>{result.validUntil}</strong></div>
                                <div className="res-row"><span>Autoridade:</span> <strong>{result.authority}</strong></div>
                            </div>
                            <div className="res-footer">
                                Documento verificado através da tecnologia STCW-Secure do Marítimo Training Center.
                            </div>
                        </div>
                    )}

                    {result && result.status === 'invalid' && (
                        <div className="result-card invalid shadow-sm">
                            <span className="invalid-icon">❌</span>
                            <h3>Código Inválido</h3>
                            <p>Não foi encontrado nenhum certificado com este identificador na nossa base de dados oficial.</p>
                        </div>
                    )}

                    {!result && !scanning && (
                        <div className="verify-instructions card shadow-sm">
                            <h4>Como verificar?</h4>
                            <ul>
                                <li>Observe o código impresso no verso do seu certificado.</li>
                                <li>Insira o código completo no campo ao lado.</li>
                                <li>Aguarde a validação dos nossos sistemas centrais.</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .verify-page { padding: 1rem 0; }
                .page-header { margin-bottom: 3rem; }
                .page-header h1 { font-size: 1.8rem; color: #2D180F; margin-top: 0.5rem; }
                
                .verify-layout { display: grid; grid-template-columns: 400px 1fr; gap: 3rem; align-items: start; }
                
                .verify-card { padding: 2rem; border-radius: 20px; }
                .qr-box { margin-bottom: 2rem; }
                .qr-scanner-sim { height: 200px; background: #0f172a; border-radius: 16px; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 4px solid #1e293b; }
                .qr-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.8; }
                .qr-scanner-sim p { font-size: 0.75rem; color: #cbd5e1; font-weight: 600; }
                
                .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: #60a5fa; box-shadow: 0 0 10px #60a5fa; animation: scan 2s infinite linear; }
                @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
                
                .verify-form { display: flex; flex-direction: column; gap: 1.5rem; }
                .field label { display: block; font-size: 0.8rem; font-weight: 800; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase; }
                .field input { width: 100%; padding: 1rem; border-radius: 12px; border: 2px solid #edf2f7; background: #f8fafc; font-family: 'Outfit', sans-serif; font-weight: 700; letter-spacing: 0.05em; font-size: 1rem; color: #2D180F; }
                .field input:focus { outline: none; border-color: #EA580C; background: white; }
                
                .btn-verify { background: #2D180F; color: white; border: none; padding: 1rem; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 5px 15px rgba(10,42,94,0.15); }
                .btn-verify:hover { background: #EA580C; transform: translateY(-2px); }
                .btn-verify:disabled { opacity: 0.6; cursor: not-allowed; }
                
                .result-area { min-height: 400px; }
                .result-card { padding: 2.5rem; border-radius: 24px; animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                .result-card.valid { background: white; border-top: 8px solid #10b981; }
                .res-hdr { display: flex; gap: 1.5rem; align-items: center; margin-bottom: 2rem; }
                .valid-icon { font-size: 2.5rem; background: #ecfdf5; border-radius: 50%; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; }
                .res-hdr h3 { margin: 0; color: #064e3b; font-size: 1.4rem; font-weight: 800; }
                .res-hdr p { margin: 0; color: #10b981; font-weight: 700; font-family: 'Outfit', sans-serif; }
                
                .res-body { display: flex; flex-direction: column; gap: 1rem; padding: 1.5rem; background: #f8fafc; border-radius: 16px; margin-bottom: 1.5rem; }
                .res-row { display: flex; justify-content: space-between; font-size: 0.95rem; border-bottom: 1px dashed #e2e8f0; padding-bottom: 0.5rem; }
                .res-row span { color: #64748b; font-weight: 600; }
                .res-row strong { color: #0f172a; font-weight: 800; }
                
                .res-footer { font-size: 0.75rem; color: #94a3b8; text-align: center; font-style: italic; }
                
                .result-card.invalid { text-align: center; background: #fff1f2; border: 2px solid #fecaca; }
                .invalid-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
                .result-card.invalid h3 { color: #991b1b; font-weight: 800; }
                .result-card.invalid p { color: #b91c1c; font-weight: 500; }
                
                .verify-instructions { padding: 2rem; background: #FDF2E9; border: 1px solid #FDF2E9; }
                .verify-instructions h4 { margin-top: 0; color: #2D180F; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.8rem; margin-bottom: 1rem; }
                .verify-instructions ul { padding-left: 1.25rem; color: #2D180F; font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.75rem; }
            `}</style>
        </div>
    );
}
