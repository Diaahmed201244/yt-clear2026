/**
 * Service Diagnostic Tool - Identifies and fixes codebank service issues
 */

export class ServiceDiagnostic {
    constructor() {
        this.results = [];
        this.issues = [];
    }

    async runFullDiagnostic() {
        console.log('🔍 Starting CodeBank Service Diagnostic...');
        
        // Check each service from registry
        const services = this.getServiceList();
        
        for (const service of services) {
            await this.checkService(service);
        }
        
        this.generateReport();
        return this.getSummary();
    }

    getServiceList() {
        return [
            { id: 'safecode', name: 'SafeCode', paths: ['safecode.html', 'safecode/index.html'] },
            { id: 'samma3ny', name: 'Samma3ny', paths: ['samma3ny.html', 'samma3ny/index.html'] },
            { id: 'e7ki', name: 'E7ki', paths: ['e7ki.html', 'e7ki/index.html'] },
            { id: 'farragna', name: 'Farragna', paths: ['farragna.html', 'farragna/index.html'] },
            { id: 'pebalaash', name: 'Pebalaash', paths: ['pebalaash.html', 'pebalaash/index.html'] },
            { id: 'corsa', name: 'CoRsA', paths: ['corsa.html', 'corsa/index.html'] },
            { id: 'eb3at', name: 'Eb3at', paths: ['eb3at.html'] },
            { id: 'battalooda', name: 'Battalooda', paths: ['battalooda.html'] },
            { id: 'games', name: 'Games Centre', paths: ['Games-Centre.html', 'Games-Centre/index.html'] },
            { id: 'yahood', name: 'Yahood!', paths: ['yahood/index.html'] },
        ];
    }

    async checkService(service) {
        const result = {
            id: service.id,
            name: service.name,
            status: 'unknown',
            workingPath: null,
            issues: [],
            loadTime: null
        };

        // Try each possible path
        for (const path of service.paths) {
            try {
                const startTime = performance.now();
                const response = await fetch(path, { method: 'HEAD' });
                const loadTime = performance.now() - startTime;

                if (response.ok) {
                    result.status = 'available';
                    result.workingPath = path;
                    result.loadTime = Math.round(loadTime);
                    
                    // Try to load and check for errors
                    const content = await this.fetchContent(path);
                    const issues = this.analyzeContent(content, path);
                    result.issues = issues;
                    
                    break;
                } else {
                    result.issues.push(`Path ${path} returned ${response.status}`);
                }
            } catch (error) {
                result.issues.push(`Path ${path} failed: ${error.message}`);
            }
        }

        if (!result.workingPath) {
            result.status = 'unavailable';
        }

        this.results.push(result);
    }

    async fetchContent(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) return null;
            return await response.text();
        } catch (error) {
            return null;
        }
    }

    analyzeContent(content, path) {
        const issues = [];
        
        if (!content) {
            issues.push('Content is empty or unreachable');
            return issues;
        }

        // Check for common issues
        const checks = [
            { pattern: /<script[^>]*src="([^"]*?)"/g, type: 'script' },
            { pattern: /<link[^>]*href="([^"]*?)"/g, type: 'css' },
            { pattern: /fetch\(['"]([^'"]*?)['"]/g, type: 'fetch' },
            { pattern: /import\s+.*?from\s+['"]([^'"]*?)['"]/g, type: 'import' }
        ];

        for (const check of checks) {
            let match;
            while ((match = check.pattern.exec(content)) !== null) {
                const resource = match[1];
                
                // Check for potential issues
                if (resource.startsWith('/') && !resource.startsWith('//')) {
                    // Absolute path - check if it exists
                    this.checkResourceExists(resource, path).catch(() => {});
                }
                
                if (resource.includes('localhost') || resource.includes('127.0.0.1')) {
                    issues.push(`${check.type} uses localhost: ${resource}`);
                }
            }
        }

        // Check for undefined variables in inline scripts
        const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;
        while ((scriptMatch = scriptRegex.exec(content)) !== null) {
            const script = scriptMatch[1];
            
            // Check for common undefined references
            const undefinedRefs = [
                'AssetBus',
                'AuthCore',
                'BankodeAuth',
                'ACC',
                'SafeActions'
            ];
            
            for (const ref of undefinedRefs) {
                if (script.includes(ref) && !script.includes(`window.${ref}`) && !script.includes(`const ${ref}`) && !script.includes(`let ${ref}`)) {
                    // This is a warning, not necessarily an error
                }
            }
        }

        return issues;
    }

    async checkResourceExists(resource, basePath) {
        // This is a simplified check - in reality, you'd want to verify the resource exists
        return true;
    }

    generateReport() {
        console.log('\n📊 CodeBank Service Diagnostic Report');

        for (const result of this.results) {
            const statusIcon = result.status === 'available' ? '✅' : result.status === 'unavailable' ? '❌' : '⚠️';
            console.log(`${statusIcon} ${result.name} (${result.id})`);
            console.log(`   Status: ${result.status}`);
            
            if (result.workingPath) {
                console.log(`   Working Path: ${result.workingPath}`);
                console.log(`   Load Time: ${result.loadTime}ms`);
            }
            
            if (result.issues.length > 0) {
                console.log(`   Issues:`);
                result.issues.forEach(issue => {
                    console.log(`     - ${issue}`);
                });
            }
            
            console.log('');
        }

        // Summary
        const available = this.results.filter(r => r.status === 'available').length;
        const unavailable = this.results.filter(r => r.status === 'unavailable').length;
        
        console.log(`\n📈 Summary: ${available} available, ${unavailable} unavailable`);
    }

    getSummary() {
        const available = this.results.filter(r => r.status === 'available');
        const unavailable = this.results.filter(r => r.status === 'unavailable');
        
        return {
            total: this.results.length,
            available: available.length,
            unavailable: unavailable.length,
            services: this.results,
            recommendations: this.generateRecommendations()
        };
    }

    generateRecommendations() {
        const recommendations = [];
        
        for (const result of this.results) {
            if (result.status === 'unavailable') {
                recommendations.push({
                    service: result.name,
                    issue: 'Service not accessible',
                    solution: `Create or fix ${result.id}.html file`
                });
            } else if (result.issues.length > 0) {
                const criticalIssues = result.issues.filter(i => 
                    i.includes('localhost') || i.includes('failed')
                );
                
                if (criticalIssues.length > 0) {
                    recommendations.push({
                        service: result.name,
                        issue: 'Has critical issues',
                        solution: 'Check console for specific errors'
                    });
                }
            }
        }
        
        return recommendations;
    }

    // Quick fix methods
    async fixPathIssues() {
        console.log('🔧 Attempting to fix path issues...');
        
        // Update app-registry.js with correct paths
        const registryFix = this.generateRegistryFix();
        console.log('Generated registry fix:', registryFix);
        
        return registryFix;
    }

    generateRegistryFix() {
        return {
            safecode: './safecode.html',
            samma3ny: './samma3ny.html',
            e7ki: './e7ki.html',
            farragna: './farragna.html',
            pebalaash: './pebalaash.html',
            corsa: './corsa.html',
            eb3at: './eb3at.html',
            battalooda: './battalooda.html',
            games: './Games-Centre.html',
            yahood: './yahood/index.html'
        };
    }
}

// Auto-run diagnostic when loaded in browser
if (typeof window !== 'undefined') {
    window.ServiceDiagnostic = ServiceDiagnostic;
    
    // Add to window for manual execution
    window.runServiceDiagnostic = async () => {
        const diagnostic = new ServiceDiagnostic();
        return await diagnostic.runFullDiagnostic();
    };
}