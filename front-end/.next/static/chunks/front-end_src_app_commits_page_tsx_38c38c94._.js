(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/front-end/src/app/commits/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CommitsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front-end/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front-end/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/front-end/node_modules/d3/src/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__ = __turbopack_context__.i("[project]/front-end/node_modules/d3-selection/src/select.js [app-client] (ecmascript) <export default as select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$scale$2f$src$2f$band$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleBand$3e$__ = __turbopack_context__.i("[project]/front-end/node_modules/d3-scale/src/band.js [app-client] (ecmascript) <export default as scaleBand>");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__ = __turbopack_context__.i("[project]/front-end/node_modules/d3-scale/src/linear.js [app-client] (ecmascript) <export default as scaleLinear>");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front-end/node_modules/d3-axis/src/axis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__ = __turbopack_context__.i("[project]/front-end/node_modules/d3-array/src/max.js [app-client] (ecmascript) <export default as max>");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$shape$2f$src$2f$pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__pie$3e$__ = __turbopack_context__.i("[project]/front-end/node_modules/d3-shape/src/pie.js [app-client] (ecmascript) <export default as pie>");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$shape$2f$src$2f$arc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__arc$3e$__ = __turbopack_context__.i("[project]/front-end/node_modules/d3-shape/src/arc.js [app-client] (ecmascript) <export default as arc>");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$scale$2f$src$2f$ordinal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleOrdinal$3e$__ = __turbopack_context__.i("[project]/front-end/node_modules/d3-scale/src/ordinal.js [app-client] (ecmascript) <export default as scaleOrdinal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$scale$2d$chromatic$2f$src$2f$categorical$2f$Tableau10$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__schemeTableau10$3e$__ = __turbopack_context__.i("[project]/front-end/node_modules/d3-scale-chromatic/src/categorical/Tableau10.js [app-client] (ecmascript) <export default as schemeTableau10>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
function Histogram(param) {
    let { data } = param;
    _s();
    const svgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Histogram.useEffect": ()=>{
            if (!svgRef.current) return;
            const svg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(svgRef.current);
            svg.selectAll('*').remove();
            if (!data.length) {
                svg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').attr('fill', 'currentColor').text('Nenhum commit disponível para este repositório');
                return;
            }
            const width = 700;
            const height = 300;
            const margin = {
                top: 24,
                right: 24,
                bottom: 72,
                left: 56
            };
            const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$scale$2f$src$2f$band$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleBand$3e$__["scaleBand"])().domain(data.map({
                "Histogram.useEffect.x": (d)=>d.dateLabel
            }["Histogram.useEffect.x"])).range([
                margin.left,
                width - margin.right
            ]).padding(0.12);
            var _max;
            const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__["scaleLinear"])().domain([
                0,
                (_max = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__["max"])(data, {
                    "Histogram.useEffect.y": (d)=>d.count
                }["Histogram.useEffect.y"])) !== null && _max !== void 0 ? _max : 0
            ]).nice().range([
                height - margin.bottom,
                margin.top
            ]);
            svg.attr('viewBox', "0 0 ".concat(width, " ").concat(height));
            const tickInterval = Math.max(1, Math.floor(data.length / 12));
            const tickValues = data.map({
                "Histogram.useEffect.tickValues": (d, i)=>({
                        v: d.dateLabel,
                        i
                    })
            }["Histogram.useEffect.tickValues"]).filter({
                "Histogram.useEffect.tickValues": (x)=>x.i % tickInterval === 0
            }["Histogram.useEffect.tickValues"]).map({
                "Histogram.useEffect.tickValues": (x)=>x.v
            }["Histogram.useEffect.tickValues"]);
            const xAxis = svg.append('g').attr('transform', "translate(0, ".concat(height - margin.bottom, ")")).call((0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["axisBottom"])(x).tickValues(tickValues).tickFormat({
                "Histogram.useEffect.xAxis": (v)=>String(v)
            }["Histogram.useEffect.xAxis"]));
            xAxis.selectAll('text').style('text-anchor', 'end').attr('dx', '-0.6em').attr('dy', '0.15em').attr('transform', 'rotate(-35)');
            const yAxis = svg.append('g').attr('transform', "translate(".concat(margin.left, ",0)")).call((0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["axisLeft"])(y).ticks(6));
            yAxis.append('text').attr('x', 0).attr('y', margin.top - 16).attr('fill', 'currentColor').attr('text-anchor', 'start').attr('font-size', 12).text('Commits');
            svg.append('g').selectAll('rect').data(data).join('rect').attr('x', {
                "Histogram.useEffect": (d)=>{
                    var _x;
                    return (_x = x(d.dateLabel)) !== null && _x !== void 0 ? _x : margin.left;
                }
            }["Histogram.useEffect"]).attr('y', {
                "Histogram.useEffect": (d)=>y(d.count)
            }["Histogram.useEffect"]).attr('width', x.bandwidth()).attr('height', {
                "Histogram.useEffect": (d)=>y(0) - y(d.count)
            }["Histogram.useEffect"]).attr('rx', 4).attr('fill', 'var(--color-primary, #2563eb)').append('title').text({
                "Histogram.useEffect": (d)=>"".concat(d.dateLabel, ": ").concat(d.count, " commit(s)")
            }["Histogram.useEffect"]);
        }
    }["Histogram.useEffect"], [
        data
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        ref: svgRef,
        className: "w-full h-[300px]",
        role: "img",
        "aria-label": "Histograma"
    }, void 0, false, {
        fileName: "[project]/front-end/src/app/commits/page.tsx",
        lineNumber: 95,
        columnNumber: 10
    }, this);
}
_s(Histogram, "89Ty783ABEwsfMbSOeu9vscWF34=");
_c = Histogram;
function PieChart(param) {
    let { data } = param;
    _s1();
    const svgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PieChart.useEffect": ()=>{
            if (!svgRef.current) return;
            const svg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(svgRef.current);
            svg.selectAll('*').remove();
            if (!data.length) {
                svg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').attr('fill', 'currentColor').text('Nenhum commit disponível para este repositório');
                return;
            }
            const width = 320;
            const height = 320;
            const radius = Math.min(width, height) / 2 - 6;
            const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$scale$2f$src$2f$ordinal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleOrdinal$3e$__["scaleOrdinal"])().domain(data.map({
                "PieChart.useEffect.color": (d)=>d.label
            }["PieChart.useEffect.color"])).range([
                ...__TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$scale$2d$chromatic$2f$src$2f$categorical$2f$Tableau10$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__schemeTableau10$3e$__["schemeTableau10"],
                ...__TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$scale$2d$chromatic$2f$src$2f$categorical$2f$Tableau10$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__schemeTableau10$3e$__["schemeTableau10"]
            ]);
            svg.attr('viewBox', "0 0 ".concat(width, " ").concat(height));
            const g = svg.append('g').attr('transform', "translate(".concat(width / 2, ",").concat(height / 2, ")"));
            const pieGen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$shape$2f$src$2f$pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__pie$3e$__["pie"])().sort(null).value({
                "PieChart.useEffect.pieGen": (d)=>d.value
            }["PieChart.useEffect.pieGen"]);
            const arcGen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$shape$2f$src$2f$arc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__arc$3e$__["arc"])().innerRadius(0).outerRadius(radius);
            const arcs = pieGen(data);
            g.selectAll('path').data(arcs).join('path').attr('d', {
                "PieChart.useEffect": (d)=>{
                    var _arcGen;
                    return (_arcGen = arcGen(d)) !== null && _arcGen !== void 0 ? _arcGen : '';
                }
            }["PieChart.useEffect"]).attr('fill', {
                "PieChart.useEffect": (d)=>color(d.data.label)
            }["PieChart.useEffect"]).attr('stroke', '#fff').attr('stroke-width', 1.2).append('title').text({
                "PieChart.useEffect": (d)=>"".concat(d.data.label, ": ").concat(d.data.value, " commit(s)")
            }["PieChart.useEffect"]);
        }
    }["PieChart.useEffect"], [
        data
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        ref: svgRef,
        className: "w-full h-[320px]",
        role: "img",
        "aria-label": "Gráfico de pizza"
    }, void 0, false, {
        fileName: "[project]/front-end/src/app/commits/page.tsx",
        lineNumber: 134,
        columnNumber: 10
    }, this);
}
_s1(PieChart, "89Ty783ABEwsfMbSOeu9vscWF34=");
_c1 = PieChart;
function processRawCommitsData(rawCommits) {
    // Group commits by repository
    const commitsByRepo = new Map();
    for (const commit of rawCommits){
        // Skip metadata entries
        if ('_metadata' in commit) continue;
        const repoName = commit.repo_name;
        if (!repoName) continue;
        if (!commitsByRepo.has(repoName)) {
            commitsByRepo.set(repoName, []);
        }
        commitsByRepo.get(repoName).push(commit);
    }
    // Convert to our expected format
    const repositories = [];
    let repoId = 1;
    for (const [repoName, repoCommits] of commitsByRepo.entries()){
        const aggregatedCommits = repoCommits.map((commit)=>{
            var _commit_author, _commit_author1, _commit_author2;
            return {
                sha: commit.sha,
                url: commit.html_url,
                message: commit.commit.message,
                author: {
                    login: ((_commit_author = commit.author) === null || _commit_author === void 0 ? void 0 : _commit_author.login) || commit.commit.author.email || 'unknown',
                    displayName: commit.commit.author.name || ((_commit_author1 = commit.author) === null || _commit_author1 === void 0 ? void 0 : _commit_author1.login) || 'Desconhecido',
                    profileUrl: (_commit_author2 = commit.author) === null || _commit_author2 === void 0 ? void 0 : _commit_author2.html_url
                },
                committedAt: commit.commit.author.date
            };
        });
        repositories.push({
            id: repoId++,
            name: repoName,
            fullName: "unb-mds/".concat(repoName),
            url: "https://github.com/unb-mds/".concat(repoName),
            defaultBranch: 'main',
            commits: aggregatedCommits
        });
    }
    // Calculate total commits
    const totalCommits = repositories.reduce((sum, repo)=>sum + repo.commits.length, 0);
    return {
        org: 'unb-mds',
        generatedAt: new Date().toISOString(),
        repoCount: repositories.length,
        totalCommits,
        repositories
    };
}
function CommitsPage() {
    _s2();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedRepoId, setSelectedRepoId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CommitsPage.useEffect": ()=>{
            // Não fazer fetch durante build/export estático
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            let cancelled = false;
            async function fetchData() {
                try {
                    setLoading(true);
                    const response = await fetch('https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/issue45/43/42-bronze-extraction-consolidation/data/bronze/commits_all.json');
                    if (!response.ok) {
                        throw new Error("Erro ao buscar dados: ".concat(response.status, " ").concat(response.statusText));
                    }
                    const rawCommits = await response.json();
                    // Process raw commits into our expected format
                    const processedData = processRawCommitsData(rawCommits);
                    if (!cancelled) {
                        setData(processedData);
                        setSelectedRepoId('all');
                        setError(null);
                    }
                } catch (err) {
                    if (!cancelled) {
                        setError(err instanceof Error ? err.message : String(err));
                    }
                } finally{
                    if (!cancelled) {
                        setLoading(false);
                    }
                }
            }
            fetchData();
            return ({
                "CommitsPage.useEffect": ()=>{
                    cancelled = true;
                }
            })["CommitsPage.useEffect"];
        }
    }["CommitsPage.useEffect"], []);
    const repositoriesSource = data === null || data === void 0 ? void 0 : data.repositories;
    const repositories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CommitsPage.useMemo[repositories]": ()=>repositoriesSource !== null && repositoriesSource !== void 0 ? repositoriesSource : []
    }["CommitsPage.useMemo[repositories]"], [
        repositoriesSource
    ]);
    const selectedRepo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CommitsPage.useMemo[selectedRepo]": ()=>{
            if (selectedRepoId === 'all') {
                return {
                    id: -1,
                    name: 'Todos os repositórios',
                    fullName: 'Todos os repositórios',
                    url: '#',
                    defaultBranch: 'main',
                    commits: repositories.flatMap({
                        "CommitsPage.useMemo[selectedRepo]": (repo)=>repo.commits
                    }["CommitsPage.useMemo[selectedRepo]"])
                };
            }
            var _repositories_find;
            return (_repositories_find = repositories.find({
                "CommitsPage.useMemo[selectedRepo]": (repo)=>repo.id === selectedRepoId
            }["CommitsPage.useMemo[selectedRepo]"])) !== null && _repositories_find !== void 0 ? _repositories_find : null;
        }
    }["CommitsPage.useMemo[selectedRepo]"], [
        repositories,
        selectedRepoId
    ]);
    // Reset selection if repo no longer exists
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CommitsPage.useEffect": ()=>{
            if (repositories.length === 0) return;
            if (selectedRepoId === 'all') return;
            const exists = repositories.some({
                "CommitsPage.useEffect.exists": (repo)=>repo.id === selectedRepoId
            }["CommitsPage.useEffect.exists"]);
            if (!exists) {
                setSelectedRepoId('all');
            }
        }
    }["CommitsPage.useEffect"], [
        repositories,
        selectedRepoId
    ]);
    const histogramData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CommitsPage.useMemo[histogramData]": ()=>{
            if (!selectedRepo) return [];
            const counts = new Map();
            for (const commit of selectedRepo.commits){
                const day = commit.committedAt.slice(0, 10);
                var _counts_get;
                counts.set(day, ((_counts_get = counts.get(day)) !== null && _counts_get !== void 0 ? _counts_get : 0) + 1);
            }
            return [
                ...counts.entries()
            ].map({
                "CommitsPage.useMemo[histogramData]": (param)=>{
                    let [dateLabel, count] = param;
                    return {
                        dateLabel,
                        count
                    };
                }
            }["CommitsPage.useMemo[histogramData]"]).sort({
                "CommitsPage.useMemo[histogramData]": (a, b)=>a.dateLabel < b.dateLabel ? -1 : a.dateLabel > b.dateLabel ? 1 : 0
            }["CommitsPage.useMemo[histogramData]"]);
        }
    }["CommitsPage.useMemo[histogramData]"], [
        selectedRepo
    ]);
    const pieData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CommitsPage.useMemo[pieData]": ()=>{
            if (!selectedRepo) return [];
            const counts = new Map();
            for (const commit of selectedRepo.commits){
                const label = commit.author.displayName || commit.author.login || 'Desconhecido';
                var _counts_get;
                counts.set(label, ((_counts_get = counts.get(label)) !== null && _counts_get !== void 0 ? _counts_get : 0) + 1);
            }
            const sorted = [
                ...counts.entries()
            ].sort({
                "CommitsPage.useMemo[pieData].sorted": (a, b)=>b[1] - a[1]
            }["CommitsPage.useMemo[pieData].sorted"]);
            const top = sorted.slice(0, 8);
            const restTotal = sorted.slice(8).reduce({
                "CommitsPage.useMemo[pieData].restTotal": (acc, param)=>{
                    let [, value] = param;
                    return acc + value;
                }
            }["CommitsPage.useMemo[pieData].restTotal"], 0);
            const result = top.map({
                "CommitsPage.useMemo[pieData].result": (param)=>{
                    let [label, value] = param;
                    return {
                        label,
                        value
                    };
                }
            }["CommitsPage.useMemo[pieData].result"]);
            if (restTotal > 0) {
                result.push({
                    label: 'Outros',
                    value: restTotal
                });
            }
            return result;
        }
    }["CommitsPage.useMemo[pieData]"], [
        selectedRepo
    ]);
    const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$scale$2f$src$2f$ordinal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleOrdinal$3e$__["scaleOrdinal"])().domain(pieData.map((d)=>d.label)).range([
        ...__TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$scale$2d$chromatic$2f$src$2f$categorical$2f$Tableau10$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__schemeTableau10$3e$__["schemeTableau10"],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$d3$2d$scale$2d$chromatic$2f$src$2f$categorical$2f$Tableau10$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__schemeTableau10$3e$__["schemeTableau10"]
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-black text-white relative overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-gradient-to-br from-slate-900/20 via-black to-blue-950/30"
            }, void 0, false, {
                fileName: "[project]/front-end/src/app/commits/page.tsx",
                lineNumber: 306,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"
            }, void 0, false, {
                fileName: "[project]/front-end/src/app/commits/page.tsx",
                lineNumber: 307,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-0 left-0 w-80 h-80 bg-slate-600/10 rounded-full blur-3xl"
            }, void 0, false, {
                fileName: "[project]/front-end/src/app/commits/page.tsx",
                lineNumber: 308,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-20",
                style: {
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                }
            }, void 0, false, {
                fileName: "[project]/front-end/src/app/commits/page.tsx",
                lineNumber: 311,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative mx-auto w-full max-w-8xl px-4 sm:px-6 lg:px-8 py-8 pt-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-4xl font-didot text-blue-600 leading-tight mb-2",
                        children: "Métricas - Commits"
                    }, void 0, false, {
                        fileName: "[project]/front-end/src/app/commits/page.tsx",
                        lineNumber: 318,
                        columnNumber: 9
                    }, this),
                    selectedRepo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-white/70 text-sm mb-4",
                        children: selectedRepo.name === 'Todos os repositórios' ? "Mostrando dados agregados de ".concat(repositories.length, " repositório(s) • ").concat(selectedRepo.commits.length, " commits total") : "Repositório: ".concat(selectedRepo.name, " • ").concat(selectedRepo.commits.length, " commits")
                    }, void 0, false, {
                        fileName: "[project]/front-end/src/app/commits/page.tsx",
                        lineNumber: 320,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-end -mt-3 mb-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full sm:w-auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: selectedRepoId,
                                onChange: (e)=>setSelectedRepoId(e.target.value === 'all' ? 'all' : Number(e.target.value)),
                                className: "w-full sm:w-auto rounded-md shadow px-3 py-2 text-sm border-none outline-none cursor-pointer",
                                style: {
                                    background: '#4F4F4F',
                                    color: '#ffffff'
                                },
                                disabled: loading,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: [
                                            "Todos os repositórios (",
                                            repositories.flatMap((r)=>r.commits).length,
                                            " commits)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/front-end/src/app/commits/page.tsx",
                                        lineNumber: 338,
                                        columnNumber: 15
                                    }, this),
                                    repositories.map((repo)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: repo.id,
                                            children: [
                                                repo.name,
                                                " (",
                                                repo.commits.length,
                                                " commits)"
                                            ]
                                        }, repo.id, true, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 342,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/front-end/src/app/commits/page.tsx",
                                lineNumber: 331,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                            lineNumber: 330,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/front-end/src/app/commits/page.tsx",
                        lineNumber: 329,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "flex flex-col lg:flex-row gap-6 -mt-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hidden lg:flex lg:flex-col lg:w-20",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-lg overflow-hidden h-full",
                                    style: {
                                        background: '#4F4F4F',
                                        color: '#ffffff'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 flex items-center justify-center py-2 text-sm",
                                            children: "Issues"
                                        }, void 0, false, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 355,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-px bg-slate-600"
                                        }, void 0, false, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 356,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 flex items-center justify-center py-2 text-sm",
                                            children: "PRs"
                                        }, void 0, false, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 357,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-px bg-slate-600"
                                        }, void 0, false, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 358,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 flex items-center justify-center py-2 text-sm",
                                            children: "Commits"
                                        }, void 0, false, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 359,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-px bg-slate-600"
                                        }, void 0, false, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 360,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 flex items-center justify-center py-2 text-sm",
                                            children: "Colaboração"
                                        }, void 0, false, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 361,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-px bg-slate-600"
                                        }, void 0, false, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 362,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 flex items-center justify-center py-2 text-sm",
                                            children: "Estruturas"
                                        }, void 0, false, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 363,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/front-end/src/app/commits/page.tsx",
                                    lineNumber: 353,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/front-end/src/app/commits/page.tsx",
                                lineNumber: 352,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 rounded-xl bg-white p-5 text-slate-900 shadow-sm min-h-[320px] flex flex-col min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-md font-medium",
                                                children: "Commits"
                                            }, void 0, false, {
                                                fileName: "[project]/front-end/src/app/commits/page.tsx",
                                                lineNumber: 370,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, void 0, false, {
                                                fileName: "[project]/front-end/src/app/commits/page.tsx",
                                                lineNumber: 371,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/front-end/src/app/commits/page.tsx",
                                        lineNumber: 369,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "py-8 text-center",
                                            children: "Carregando..."
                                        }, void 0, false, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 375,
                                            columnNumber: 17
                                        }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "py-8 text-center text-rose-600",
                                            children: error
                                        }, void 0, false, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 377,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Histogram, {
                                            data: histogramData
                                        }, void 0, false, {
                                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                                            lineNumber: 379,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/front-end/src/app/commits/page.tsx",
                                        lineNumber: 373,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/front-end/src/app/commits/page.tsx",
                                lineNumber: 368,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full lg:w-[480px] rounded-xl bg-white p-5 text-slate-900 shadow-sm min-h-[340px] flex flex-col",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-md font-medium",
                                        children: "Por pessoa"
                                    }, void 0, false, {
                                        fileName: "[project]/front-end/src/app/commits/page.tsx",
                                        lineNumber: 386,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4 flex gap-4 items-start flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-48 flex-shrink-0",
                                                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: "..."
                                                }, void 0, false, {
                                                    fileName: "[project]/front-end/src/app/commits/page.tsx",
                                                    lineNumber: 388,
                                                    columnNumber: 62
                                                }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-rose-600",
                                                    children: error
                                                }, void 0, false, {
                                                    fileName: "[project]/front-end/src/app/commits/page.tsx",
                                                    lineNumber: 388,
                                                    columnNumber: 83
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PieChart, {
                                                    data: pieData
                                                }, void 0, false, {
                                                    fileName: "[project]/front-end/src/app/commits/page.tsx",
                                                    lineNumber: 388,
                                                    columnNumber: 126
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/front-end/src/app/commits/page.tsx",
                                                lineNumber: 388,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                className: "space-y-2 text-sm overflow-auto",
                                                children: pieData.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "inline-block h-3 w-3",
                                                                style: {
                                                                    background: color(item.label)
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/front-end/src/app/commits/page.tsx",
                                                                lineNumber: 392,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "truncate",
                                                                children: item.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/front-end/src/app/commits/page.tsx",
                                                                lineNumber: 393,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "ml-auto font-medium",
                                                                children: item.value
                                                            }, void 0, false, {
                                                                fileName: "[project]/front-end/src/app/commits/page.tsx",
                                                                lineNumber: 394,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, item.label, true, {
                                                        fileName: "[project]/front-end/src/app/commits/page.tsx",
                                                        lineNumber: 391,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/front-end/src/app/commits/page.tsx",
                                                lineNumber: 389,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/front-end/src/app/commits/page.tsx",
                                        lineNumber: 387,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/front-end/src/app/commits/page.tsx",
                                lineNumber: 385,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/front-end/src/app/commits/page.tsx",
                        lineNumber: 350,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-6 flex justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "bg-blue-600 text-white px-4 py-2 rounded-md",
                            children: "explicar com IA"
                        }, void 0, false, {
                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                            lineNumber: 403,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/front-end/src/app/commits/page.tsx",
                        lineNumber: 402,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-md p-6",
                            style: {
                                height: 'calc(320px / 5)',
                                background: '#4F4F4F',
                                color: '#ffffff'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2d$end$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-full flex items-center justify-center text-lg font-semibold",
                                children: "EXPLICAÇÃO DA IA"
                            }, void 0, false, {
                                fileName: "[project]/front-end/src/app/commits/page.tsx",
                                lineNumber: 409,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/front-end/src/app/commits/page.tsx",
                            lineNumber: 408,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/front-end/src/app/commits/page.tsx",
                        lineNumber: 407,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/front-end/src/app/commits/page.tsx",
                lineNumber: 316,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/front-end/src/app/commits/page.tsx",
        lineNumber: 304,
        columnNumber: 5
    }, this);
}
_s2(CommitsPage, "H86TZb+b2J0ohleN9dhbkCfXxpY=");
_c2 = CommitsPage;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "Histogram");
__turbopack_context__.k.register(_c1, "PieChart");
__turbopack_context__.k.register(_c2, "CommitsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=front-end_src_app_commits_page_tsx_38c38c94._.js.map