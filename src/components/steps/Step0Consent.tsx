import React from 'react';
import { type IncidentData, type IncidentDataUpdater } from '../../../types';
import CustomCheckbox from '../ui/CustomCheckbox';

interface Step0Props {
    data: Pick<IncidentData, 'consentAcknowledged'>;
    updateData: IncidentDataUpdater;
    errors: { consentAcknowledged?: string; };
}

const Step0Consent: React.FC<Step0Props> = ({ data, updateData, errors }) => {
    const consentError = errors.consentAcknowledged;

    return (
        <div className="space-y-8 animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
            <div className="text-center mb-8">
                <img 
                    src="https://custodybuddy.com/incident-report/img/AgreeIcon.png" 
                    alt="Document with lock and checkmark" 
                    className="w-36 h-24 mx-auto mb-6 object-contain"
                    aria-hidden="true"
                />
                <h2 className="text-2xl font-bold text-amber-400 mb-2">Before We Begin</h2>
                <p className="text-slate-400 max-w-md mx-auto">Please review and acknowledge our terms before documenting your incident. This ensures transparency and legal compliance.</p>
            </div>
            <div className={`max-w-2xl mx-auto p-6 bg-black/20 rounded-xl border shadow-lg transition-all duration-300 ${consentError ? 'border-red-500' : 'border-slate-700'}`}>
                <h3 className="font-bold text-slate-100 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 text-amber-400"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    Required Acknowledgment
                </h3>
                <CustomCheckbox
                    label={
                        <>
                            I acknowledge that I have read and agree to the <a href="https://custodybuddy.com/incident-report/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Privacy Policy</a>, <a href="https://custodybuddy.com/incident-report/terms-of-use/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Terms of Service</a>, and <a href="https://custodybuddy.com/incident-report/legal-disclaimer/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Legal Disclaimer</a>. I understand that this service does not provide legal advice and I should consult a qualified lawyer for my specific situation.
                        </>
                    }
                    isChecked={data.consentAcknowledged}
                    onChange={(checked) => updateData('consentAcknowledged', checked)}
                />
                 {consentError && (
                    <p className="text-red-400 text-xs mt-2">{consentError}</p>
                )}
            </div>
        </div>
    );
};

export default Step0Consent;
