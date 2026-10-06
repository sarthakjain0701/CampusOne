/* ==========================================================================
   CAMPUS INTELLIGENCE SERVICE (PHASE 1 - FOUNDATION)
   Deterministic Analytics & Early Signals
   Compatible with Firebase Spark Plan (No external APIs, No Cloud Functions)
   ========================================================================== */

const CampusIntelligenceService = {
    /**
     * Calculate current attendance percentage
     */
    calculateAttendancePercentage: function(presentClasses, totalMarkedClasses) {
        if (!totalMarkedClasses || totalMarkedClasses <= 0) return 0;
        if (presentClasses == null || presentClasses < 0) presentClasses = 0;
        return Math.round((presentClasses / totalMarkedClasses) * 100);
    },

    /**
     * What-If Simulator: Calculate future scenarios
     */
    calculateWhatIfScenario: function(currentTotal, currentPresent, additionalPresent = 0, additionalAbsent = 0, targetPercentage = 75) {
        const safeTotal = Math.max(0, currentTotal || 0);
        const safePresent = Math.max(0, currentPresent || 0);
        
        const newTotal = safeTotal + additionalPresent + additionalAbsent;
        const newPresent = safePresent + additionalPresent;
        
        const currentPercentage = this.calculateAttendancePercentage(safePresent, safeTotal);
        const projectedPercentage = this.calculateAttendancePercentage(newPresent, newTotal);
        
        // Calculate classes required to reach target percentage
        let additionalRequiredForTarget = 0;
        if (currentPercentage < targetPercentage && targetPercentage < 100) {
            additionalRequiredForTarget = Math.ceil((targetPercentage * safeTotal - 100 * safePresent) / (100 - targetPercentage));
            if (additionalRequiredForTarget < 0) additionalRequiredForTarget = 0;
        }

        let scenarioType = 'NEUTRAL';
        if (additionalPresent > 0 && additionalAbsent === 0) scenarioType = 'IMPROVEMENT';
        if (additionalAbsent > 0 && additionalPresent === 0) scenarioType = 'DECLINE';

        return {
            currentPercentage,
            targetPercentage,
            projectedPercentage,
            additionalPresentClasses: additionalPresent,
            additionalAbsentClasses: additionalAbsent,
            additionalRequiredForTarget,
            scenarioType
        };
    },

    /**
     * Attendance Projection (Best/Worst Case)
     */
    calculateProjection: function(currentTotal, currentPresent, upcomingClasses = 5) {
        const current = this.calculateAttendancePercentage(currentPresent, currentTotal);
        const bestCase = this.calculateAttendancePercentage(currentPresent + upcomingClasses, currentTotal + upcomingClasses);
        const worstCase = this.calculateAttendancePercentage(currentPresent, currentTotal + upcomingClasses);
        
        return {
            current,
            bestCase,
            worstCase,
            upcomingClasses
        };
    },

    /**
     * Attendance Trend
     */
    calculateTrend: function(recentPeriodPercentage, previousPeriodPercentage) {
        if (recentPeriodPercentage == null || previousPeriodPercentage == null) {
            return { trend: 'UNKNOWN', change: 0 };
        }
        
        const change = recentPeriodPercentage - previousPeriodPercentage;
        let trend = 'STABLE';
        if (change > 0) trend = 'IMPROVING';
        if (change < 0) trend = 'DECLINING';
        
        return {
            trend,
            change
        };
    },

    /**
     * Generate structured evidence-based signal
     */
    generateSignal: function(type, severity, title, evidence, suggestedAction) {
        return {
            type,
            severity,
            title,
            evidence: Array.isArray(evidence) ? evidence : [evidence],
            suggestedAction,
            generatedAt: new Date().toISOString()
        };
    },
    
    /**
     * Generate common student signals
     */
    generateStudentSignals: function(stats, targetPercentage = 75) {
        const signals = [];
        
        if (!stats || stats.total === 0) return signals;
        
        const currentPercentage = this.calculateAttendancePercentage(stats.present, stats.total);
        
        if (currentPercentage < targetPercentage) {
            const required = this.calculateWhatIfScenario(stats.total, stats.present, 0, 0, targetPercentage).additionalRequiredForTarget;
            
            signals.push(this.generateSignal(
                'ATTENDANCE',
                'WARNING',
                `Attendance below ${targetPercentage}%`,
                [
                    `Current attendance: ${currentPercentage}%`,
                    `${stats.present} present, ${stats.absent} absent`,
                    `Target: ${targetPercentage}%`
                ],
                `Attend the next ${required} classes to reach the target.`
            ));
        } else if (currentPercentage < targetPercentage + 5) {
            signals.push(this.generateSignal(
                'ATTENDANCE',
                'INFO',
                `Attendance near minimum requirement`,
                [
                    `Current attendance: ${currentPercentage}%`,
                    `Target: ${targetPercentage}%`
                ],
                'Maintain regular attendance to avoid falling below target.'
            ));
        }
        
        return signals;
    }
};

window.CampusIntelligenceService = CampusIntelligenceService;
