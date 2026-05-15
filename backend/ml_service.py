from models import GameSessionMetrics, MemorySessionMetrics, FlexibilitySessionMetrics, SpeedSessionMetrics, CognitiveProfile
from typing import Optional

def analyze_cognitive_metrics(metrics: GameSessionMetrics, existing_profile: Optional[CognitiveProfile] = None) -> CognitiveProfile:
    """
    Mock ML Service simulating a predictive model for pediatric cognitive assessment.
    In a real-world scenario, this would evaluate the telemetry using a pre-trained Scikit-Learn model.
    """
    
    # Simple rule-based mock for Sustained Attention
    if metrics.reaction_time_ms > 500 and metrics.omission_errors > 3:
        attention_score = "Low"
    elif metrics.reaction_time_ms < 350 and metrics.omission_errors <= 1:
        attention_score = "High"
    else:
        attention_score = "Normal"
        
    # Simple rule-based mock for Impulsivity
    if metrics.commission_errors > 3:
        impulsivity_score = "High"
    elif metrics.commission_errors == 0:
        impulsivity_score = "Low"
    else:
        impulsivity_score = "Normal"
        
    # Generate recommendations based on the mock classifications
    recommendations = existing_profile.recommendations.copy() if existing_profile else []
    
    # Clear old attention/impulsivity recs if any
    new_recs = [r for r in recommendations if ("memory" in r.lower() or "span" in r.lower() or "flexibility" in r.lower() or "rule" in r.lower() or "speed" in r.lower() or "search" in r.lower())]
    
    if attention_score == "Low":
        new_recs.append("Patient exhibits clinically significant deficits in sustained attention and vigilance. Indications of attentional fatigue observed. Recommend initiating a regimen of high-frequency, low-duration cognitive behavioral interventions targeting continuous performance tasks (CPTs) to progressively increase attentional stamina.")
    elif attention_score == "High":
        new_recs.append("Sustained attention metrics indicate supranormal vigilance and negligible attentional degradation over time. Recommend introducing complex, multi-modal visual distractors to establish upper thresholds of cognitive load tolerance.")
        
    if impulsivity_score == "High":
        new_recs.append("Elevated commission error rates indicate pronounced deficits in motor response inhibition and prefrontal cognitive control. Strongly recommend immediate initiation of 'Stop-Signal' and delayed-gratification protocols to mitigate impulsive neurobehavioral tendencies.")
    elif impulsivity_score == "Low":
        new_recs.append("Exceptional motor response inhibition observed. Patient demonstrates superior prefrontal executive control and successful suppression of prepotent motor responses.")
        
    if not new_recs and not (existing_profile and (existing_profile.working_memory_score or existing_profile.cognitive_flexibility_score or existing_profile.processing_speed_score)):
        new_recs.append("Comprehensive cognitive telemetry indicates healthy, normative neurological function across evaluated domains. No acute clinical intervention is currently indicated. Maintain current neurodevelopmental engagement strategies.")

    return CognitiveProfile(
        child_id=metrics.child_id,
        attention_score=attention_score,
        impulsivity_score=impulsivity_score,
        working_memory_score=existing_profile.working_memory_score if existing_profile else None,
        cognitive_flexibility_score=existing_profile.cognitive_flexibility_score if existing_profile else None,
        processing_speed_score=existing_profile.processing_speed_score if existing_profile else None,
        recommendations=new_recs
    )

def analyze_memory_metrics(metrics: MemorySessionMetrics, existing_profile: Optional[CognitiveProfile] = None) -> CognitiveProfile:
    """
    Mock ML Service for evaluating Visuospatial Memory Span.
    """
    if metrics.max_span >= 6:
        working_memory_score = "High"
    elif metrics.max_span <= 3:
        working_memory_score = "Low"
    else:
        working_memory_score = "Normal"

    recommendations = existing_profile.recommendations.copy() if existing_profile else []
    
    # Filter out old memory recs
    new_recs = [r for r in recommendations if not ("memory" in r.lower() or "span" in r.lower())]

    if working_memory_score == "Low":
        new_recs.append("Visuospatial working memory span falls significantly below normative developmental milestones. Recommend structured therapeutic interventions utilizing spatial-sequential block-tapping to enhance dorsolateral prefrontal cortex (DLPFC) engagement and retention capacity.")
    elif working_memory_score == "High":
        new_recs.append("Visuospatial working memory span exceeds the 85th percentile. Patient demonstrates robust spatial encoding and retrieval capacities. Recommend advancing to dual N-back tasks with concurrent auditory-visual interference.")

    return CognitiveProfile(
        child_id=metrics.child_id,
        attention_score=existing_profile.attention_score if existing_profile else None,
        impulsivity_score=existing_profile.impulsivity_score if existing_profile else None,
        working_memory_score=working_memory_score,
        cognitive_flexibility_score=existing_profile.cognitive_flexibility_score if existing_profile else None,
        processing_speed_score=existing_profile.processing_speed_score if existing_profile else None,
        recommendations=new_recs
    )

def analyze_flexibility_metrics(metrics: FlexibilitySessionMetrics, existing_profile: Optional[CognitiveProfile] = None) -> CognitiveProfile:
    """
    Mock ML Service for evaluating Cognitive Flexibility (Task Switching).
    """
    if metrics.accuracy_rate >= 0.8 and metrics.avg_reaction_time_ms <= 800:
        flexibility_score = "High"
    elif metrics.accuracy_rate <= 0.6:
        flexibility_score = "Low"
    else:
        flexibility_score = "Normal"

    recommendations = existing_profile.recommendations.copy() if existing_profile else []
    
    # Filter out old flexibility recs
    new_recs = [r for r in recommendations if not ("flexibility" in r.lower() or "rule" in r.lower() or "switch" in r.lower())]

    if flexibility_score == "Low":
        new_recs.append("Metrics indicate a high perseveration rate and significant cognitive rigidity during rule-switching paradigms, suggesting deficits in set-shifting executive functions. Recommend multi-criteria sorting therapies (e.g., modified WCST protocols) to enhance prefrontal adaptability.")
    elif flexibility_score == "High":
        new_recs.append("Patient demonstrates exceptional set-shifting capabilities with minimal switch costs (accuracy and latency). Indicates robust cognitive flexibility and executive adaptability in dynamic environments.")

    return CognitiveProfile(
        child_id=metrics.child_id,
        attention_score=existing_profile.attention_score if existing_profile else None,
        impulsivity_score=existing_profile.impulsivity_score if existing_profile else None,
        working_memory_score=existing_profile.working_memory_score if existing_profile else None,
        cognitive_flexibility_score=flexibility_score,
        processing_speed_score=existing_profile.processing_speed_score if existing_profile else None,
        recommendations=new_recs
    )

def analyze_speed_metrics(metrics: SpeedSessionMetrics, existing_profile: Optional[CognitiveProfile] = None) -> CognitiveProfile:
    """
    Mock ML Service for evaluating Processing Speed (Trail Making Test).
    """
    if metrics.completion_time_ms <= 8000 and metrics.errors_made == 0:
        speed_score = "High"
    elif metrics.completion_time_ms >= 15000 or metrics.errors_made >= 3:
        speed_score = "Low"
    else:
        speed_score = "Normal"

    recommendations = existing_profile.recommendations.copy() if existing_profile else []
    
    # Filter out old speed recs
    new_recs = [r for r in recommendations if not ("speed" in r.lower() or "search" in r.lower() or "trail" in r.lower())]

    if speed_score == "Low":
        new_recs.append("Psychomotor processing speed and visual translation latency are significantly elevated. Suggests deficits in rapid perceptual-motor coupling. Recommend targeted perceptual-motor velocity training and dynamic visual search therapies.")
    elif speed_score == "High":
        new_recs.append("Psychomotor processing speed and visual scanning efficiency are situated in the superior clinical range. Negligible cognitive latency observed during complex trail-making assessments.")

    return CognitiveProfile(
        child_id=metrics.child_id,
        attention_score=existing_profile.attention_score if existing_profile else None,
        impulsivity_score=existing_profile.impulsivity_score if existing_profile else None,
        working_memory_score=existing_profile.working_memory_score if existing_profile else None,
        cognitive_flexibility_score=existing_profile.cognitive_flexibility_score if existing_profile else None,
        processing_speed_score=speed_score,
        recommendations=new_recs
    )
