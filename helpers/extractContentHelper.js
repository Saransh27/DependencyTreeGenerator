
// Extract JavaScript file imports (external)
function extractJavaScriptImports(aspxContent) {
    /* const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi; */
    // const scriptRegex = /src=["']<%#.*?\(["']([^"']+\.js)["']\).*?%>["']/i; ///src=["']<%#\s*GetVersionedUrl\(["']([^"']+\.js)["']\)\s*%>["']/i;
    const scriptRegex = /src=["']<%#\s*GetVersionedUrl\(["']([^"']+\.js)["']\)\s*%>["']|src=["']([^"']+\.js)["']/gi;
    const scripts = [];
    let match;

    while ((match = scriptRegex.exec(aspxContent)) !== null) {
        scripts.push((match[1] || match[2]).trim()); // Extract the src URL of the script
    }

    return scripts;
}

// Extract ASCX control registrations (with <%@ Register ... %> syntax)
function extractASCXControls(aspxContent) {
    const registerRegex = /<%@\s*Register\s+.*?Src=["']([^"']+\.ascx)["']\s*%>/gi;
    const ascxControls = [];
    let match;

    while ((match = registerRegex.exec(aspxContent)) !== null) {
        ascxControls.push((match[1] || match[2]).trim()); // Extract the ASCX path
    }

    return ascxControls;
}

// Extract ASCX control usage (where the registered controls are used)
function extractASCXUsage(aspxContent) {
    const controlUsageRegex = /<(\w+):(\w+).*?ID=["'](\w+)["'].*?>/gi;
    // const controlUsageRegex = /<%@ Register Src="/gi;

    const controls = [];
    let match;

    while ((match = controlUsageRegex.exec(aspxContent)) !== null) {
        controls.push({
            prefix: match[1].trim(),
            tag: match[2].trim(),
            id: match[3].trim()
        });
    }

    return controls;
}