function solveCpm(activities) {
  const nodes = new Set();
  activities.forEach((a) => {
    nodes.add(a.from);
    nodes.add(a.to);
  });
  const ids = [...nodes].sort((a, b) => a - b);
  const outgoing = Object.fromEntries(ids.map((n) => [n, []]));
  const incoming = Object.fromEntries(ids.map((n) => [n, []]));
  activities.forEach((a) => {
    outgoing[a.from].push(a);
    incoming[a.to].push(a);
  });

  const indeg = Object.fromEntries(ids.map((n) => [n, incoming[n].length]));
  const queue = ids.filter((n) => indeg[n] === 0);
  const order = [];
  const TE = Object.fromEntries(ids.map((n) => [n, indeg[n] === 0 ? 0 : -Infinity]));

  while (queue.length) {
    const n = queue.shift();
    order.push(n);
    outgoing[n].forEach((a) => {
      TE[a.to] = Math.max(TE[a.to], TE[n] + a.duration);
      indeg[a.to] -= 1;
      if (indeg[a.to] === 0) queue.push(a.to);
    });
  }

  if (order.length !== ids.length) {
    throw new Error("cycle");
  }

  const project = Math.max(...ids.map((n) => TE[n]));
  const TL = Object.fromEntries(
    ids.map((n) => [n, outgoing[n].length === 0 ? project : Infinity])
  );
  [...order].reverse().forEach((n) => {
    outgoing[n].forEach((a) => {
      TL[n] = Math.min(TL[n], TL[a.to] - a.duration);
    });
  });

  const rows = activities.map((a) => {
    const es = TE[a.from];
    const ef = es + a.duration;
    const lf = TL[a.to];
    const ls = lf - a.duration;
    const tf = lf - es - a.duration;
    const ff = TE[a.to] - es - a.duration;
    const indep = TE[a.to] - TL[a.from] - a.duration;
    return {
      ...a,
      es,
      ef,
      ls,
      lf,
      tf,
      ff,
      indep,
      critical: tf === 0,
    };
  });

  return { ids, TE, TL, rows, project, outgoing, incoming, order };
}

function layoutCpm(solved) {
  const { ids, outgoing } = solved;
  const rank = {};
  ids.forEach((n) => {
    rank[n] = 0;
  });
  let changed = true;
  while (changed) {
    changed = false;
    ids.forEach((n) => {
      outgoing[n].forEach((a) => {
        const next = rank[n] + 1;
        if (next > rank[a.to]) {
          rank[a.to] = next;
          changed = true;
        }
      });
    });
  }
  const buckets = {};
  ids.forEach((n) => {
    (buckets[rank[n]] ||= []).push(n);
  });
  const pos = {};
  const maxRank = Math.max(0, ...Object.values(rank));
  Object.keys(buckets).forEach((r) => {
    const list = buckets[r].sort((a, b) => a - b);
    list.forEach((n, i) => {
      const col = Number(r);
      const spread = Math.max(0, (list.length - 1) * 0.5);
      const detour = list.length === 1 && col !== 0 && col !== maxRank ? 118 : 0;
      pos[n] = {
        x: 90 + col * 180,
        y: 92 + (i - spread) * 140 + detour,
      };
    });
  });
  return pos;
}

function shown(set, n) {
  if (set === "all") return true;
  if (!set || set === "none") return false;
  return set.includes(n);
}

function cpmSvg(solved, opt = {}) {
  const pos = layoutCpm(solved);
  const maxX = Math.max(...Object.values(pos).map((p) => p.x)) + 90;
  const maxY = Math.max(...Object.values(pos).map((p) => p.y)) + 90;
  const revealTE = opt.revealTE ?? "all";
  const revealTL = opt.revealTL ?? "all";
  const arrows = solved.rows
    .map((a) => {
      const p1 = pos[a.from];
      const p2 = pos[a.to];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const x1 = p1.x + ux * 34;
      const y1 = p1.y + uy * 34;
      const x2 = p2.x - ux * 34;
      const y2 = p2.y - uy * 34;
      const mx = (x1 + x2) / 2 - uy * 18;
      const my = (y1 + y2) / 2 + ux * 18;
      const selected = opt.hlFrom === a.from && opt.hlTo === a.to;
      const dash = a.dummy ? "6 5" : "0";
      const color = selected ? "#fff4d6" : a.critical && opt.showCrit !== false ? "#d4a15a" : "#6fb3c8";
      const label = a.dummy ? "Dummy" : `${a.name} (${a.duration})`;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${selected || a.critical ? 2.8 : 1.6}" stroke-dasharray="${dash}" marker-end="url(#arr)"/>
        <text x="${mx}" y="${my}" text-anchor="middle" fill="${color}" font-size="12">${label}</text>`;
    })
    .join("");
  const nodes = solved.ids
    .map((n) => {
      const p = pos[n];
      const on = opt.hlNode === n;
      const te = shown(revealTE, n) ? solved.TE[n] : "?";
      const tl = shown(revealTL, n) ? solved.TL[n] : "?";
      return `<g transform="translate(${p.x},${p.y})">
        <rect x="-32" y="-28" width="64" height="56" rx="8" fill="${on ? "#2a3d4a" : "#1d272f"}" stroke="${on ? "#d4a15a" : "#2c3a45"}" stroke-width="${on ? 2.4 : 1}"/>
        <line x1="-32" y1="0" x2="32" y2="0" stroke="#2c3a45"/>
        <line x1="0" y1="-28" x2="0" y2="0" stroke="#2c3a45"/>
        <text x="-16" y="-10" text-anchor="middle" fill="#7dbe8a" font-size="11">${te}</text>
        <text x="16" y="-10" text-anchor="middle" fill="#d97a6a" font-size="11">${tl}</text>
        <text x="0" y="18" text-anchor="middle" fill="#e8eef2" font-size="14" font-weight="700">${n}</text>
      </g>`;
    })
    .join("");
  return `<svg class="cpm-svg" viewBox="0 0 ${maxX} ${maxY}" role="img" aria-label="CPM 네트워크">
    <defs>
      <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8" fill="#6fb3c8"/>
      </marker>
    </defs>
    ${arrows}${nodes}
  </svg>
  <p class="caption">결합점 위칸: 왼쪽 TE(최초, 초록) · 오른쪽 TL(최지, 적색) · 아래 번호. 금색 화살표는 주공정, 점선은 더미.</p>`;
}

function buildWalkthrough(problem) {
  const solved = solveCpm(problem.activities);
  const { ids, TE, TL, rows, project, incoming, outgoing, order } = solved;
  const steps = [];
  const teSeen = [];
  const tlSeen = [];

  steps.push({
    title: "네트워크 읽기",
    html: `<p>화살선식에서 <strong>상자 = 결합점</strong>, <strong>화살표 = 작업</strong>입니다. 숫자 D는 그 작업의 기간입니다.</p>
      <p>작업 목록: ${rows.map((r) => `<code>${r.name}</code> ${r.from}→${r.to} (${r.duration}일)`).join(" · ")}</p>
      <p>먼저 왼쪽에서 오른쪽으로 <strong>TE</strong>를 채우고, 끝에서 되돌아와 <strong>TL</strong>을 채웁니다.</p>`,
    revealTE: [],
    revealTL: [],
    showCrit: false,
  });

  order.forEach((n) => {
    const inc = incoming[n];
    let html;
    if (inc.length === 0) {
      html = `<p>시작 결합점 <strong>${n}</strong>에는 선행 작업이 없습니다.</p>
        <p>따라서 <strong>TE(${n}) = 0</strong> 으로 둡니다.</p>`;
    } else {
      const parts = inc.map(
        (a) => `작업 ${a.name}: TE(${a.from}) + ${a.duration} = ${TE[a.from] + a.duration}`
      );
      html = `<p>결합점 <strong>${n}</strong>의 TE는 들어오는 작업 EF의 <strong>최댓값</strong>입니다. 가장 늦게 도착하는 선<wbr>행이 그 점의 최초 시각입니다.</p>
        <ul>${parts.map((p) => `<li>${p}</li>`).join("")}</ul>
        <p>→ <strong>TE(${n}) = ${TE[n]}</strong></p>`;
    }
    teSeen.push(n);
    steps.push({
      title: `전진계산 TE(${n})`,
      html,
      revealTE: [...teSeen],
      revealTL: [],
      hlNode: n,
      showCrit: false,
    });
  });

  steps.push({
    title: "프로젝트 공기",
    html: `<p>끝 결합점의 TE가 전체 공기입니다. 모든 작업 기간을 더하면 안 됩니다.</p>
      <p><strong>공기 = ${project}일</strong></p>
      <p>이제 공기를 지키도록, 오른쪽에서 왼쪽으로 TL을 채웁니다. 끝점 TL은 공기와 같습니다.</p>`,
    revealTE: [...ids],
    revealTL: [],
    showCrit: false,
  });

  [...order].reverse().forEach((n) => {
    const out = outgoing[n];
    let html;
    if (out.length === 0) {
      html = `<p>끝 결합점 <strong>${n}</strong>의 최지 시각은 공기와 같습니다.</p>
        <p><strong>TL(${n}) = ${project}</strong></p>`;
    } else {
      const parts = out.map(
        (a) => `작업 ${a.name}: TL(${a.to}) − ${a.duration} = ${TL[a.to] - a.duration}`
      );
      html = `<p>결합점 <strong>${n}</strong>의 TL은 나가는 작업 (TL(j) − D)의 <strong>최솟값</strong>입니다. 가장 급하게 출발해야 하는 후행이 그 점의 한계입니다.</p>
        <ul>${parts.map((p) => `<li>${p}</li>`).join("")}</ul>
        <p>→ <strong>TL(${n}) = ${TL[n]}</strong></p>`;
    }
    tlSeen.push(n);
    steps.push({
      title: `후진계산 TL(${n})`,
      html,
      revealTE: [...ids],
      revealTL: [...tlSeen],
      hlNode: n,
      showCrit: false,
    });
  });

  rows.forEach((r) => {
    steps.push({
      title: `작업 ${r.name} (${r.from}-${r.to})`,
      html: `<p>ES = TE(${r.from}) = <strong>${r.es}</strong> · EF = ES + D = <strong>${r.ef}</strong><br/>
        LS = TL(${r.to}) − D = <strong>${r.ls}</strong> · LF = TL(${r.to}) = <strong>${r.lf}</strong></p>
        <p>총여유 TF = TL(j) − TE(i) − D = ${TL[r.to]} − ${TE[r.from]} − ${r.duration} = <strong>${r.tf}</strong><br/>
        자유여유 FF = TE(j) − TE(i) − D = ${TE[r.to]} − ${TE[r.from]} − ${r.duration} = <strong>${r.ff}</strong></p>
        <p>${r.tf === 0 ? "TF = 0 → <strong>주공정 작업</strong>입니다. 하루만 늦어도 공기가 늘어납니다." : `TF = ${r.tf} → 비주공정입니다. 최대 ${r.tf}일까지 늦춰도 공기는 그대로입니다.`}</p>`,
      revealTE: [...ids],
      revealTL: [...ids],
      hlFrom: r.from,
      hlTo: r.to,
      showCrit: false,
    });
  });

  const path = rows
    .filter((r) => r.critical)
    .map((r) => (r.dummy ? "Dummy" : r.name))
    .join(" → ");
  steps.push({
    title: "주공정선 확정",
    html: `<p>TF = 0 인 작업만 이으면 주공정선(Critical Path)입니다. 여러 갈래일 수도 있습니다.</p>
      <p><strong>${path}</strong></p>
      <p>공기 <strong>${project}일</strong>. 다음으로 표를 가리고 직접 써 보세요.</p>`,
    revealTE: [...ids],
    revealTL: [...ids],
    showCrit: true,
  });

  return { solved, steps };
}

const CPM_THEORY = [
  {
    id: "intro",
    title: "CPM이 기사에서 묻는 이유",
    body: [
      "건축기사 시공에서 CPM(Critical Path Method, 주공정법)은 네트워크 공정표로 공기를 잡는 기법입니다. PERT가 낙관·정상·비관 공기(확률)라면, CPM은 각 작업 기간이 정해진 값(확정 공기)입니다.",
      "시험은 그림을 주고 공기, 주공정선, 총여유·자유여유, 더미, 전진·후진계산을 숫자로 묻습니다. 공식만 외우지 말고 ‘결합점 시각을 채운 뒤 작업 여유를 뺀다’는 손순서를 몸에 넣으면 됩니다.",
      "이 프로그램은 국내 기사 문제의 다수인 화살선식(AOA: 화살표=작업, 원=결합점)을 기준으로 합니다. 왼쪽 메뉴의 「따라 계산하기」부터 한 칸씩 열어 보세요.",
    ],
  },
  {
    id: "notation",
    title: "화살선식·노드식·더미",
    body: [
      "화살선식(AOA)은 화살표가 작업, 동그라미(여기서는 상자)가 결합점(event)입니다. 작업 이름은 A, B 또는 i-j 로 씁니다.",
      "노드식(AON)은 상자가 작업이고 화살표는 선후관계만 나타냅니다. 계산 원리는 같고 표기만 다릅니다.",
      "더미(가상작업)는 기간 0인 점선입니다. 실제 공사는 없고 ‘이 작업이 끝나야 저 작업이 시작된다’는 제약만 표현합니다. 같은 두 결합점을 두 실작업이 동시에 이을 수 없을 때도 더미로 우회합니다.",
    ],
  },
  {
    id: "forward",
    title: "전진계산 TE · EF",
    body: [
      "전진계산은 착수에서 준공 쪽으로 최초결합점시각 TE를 채웁니다. 시작점 TE = 0.",
      "작업 i-j의 최초시작 ES = TE(i), 최초종료 EF = TE(i) + D. 결합점 j의 TE는 그 점으로 들어오는 모든 EF의 최댓값입니다.",
      "마지막 결합점의 TE가 프로젝트 공기입니다. 주공정은 이 공기를 만드는 가장 긴 경로입니다.",
    ],
    formula: "ES = TE(i)\nEF = ES + D\nTE(j) = max[ TE(i) + D(i-j) ]",
  },
  {
    id: "backward",
    title: "후진계산 TL · LS",
    body: [
      "후진계산은 준공에서 착수로 최지연결합점시각 TL을 채웁니다. 끝점 TL = TE(끝) = 공기.",
      "작업 i-j의 최지연종료 LF = TL(j), 최지연시작 LS = LF − D. 결합점 i의 TL은 나가는 모든 작업에 대해 (TL(j) − D)의 최솟값입니다.",
    ],
    formula: "LF = TL(j)\nLS = LF − D\nTL(i) = min[ TL(j) − D(i-j) ]",
  },
  {
    id: "float",
    title: "총여유 · 자유여유 · 독립여유",
    body: [
      "총여유 TF는 그 작업을 늦춰도 전체 공기를 밀지 않는 여유입니다. TF = 0 이면 주공정 작업입니다. 시험에 가장 많이 나옵니다.",
      "자유여유 FF는 후행 작업의 최초시작(ES)을 밀지 않는 여유입니다. 자기만 써도 다음 작업 ES가 안 변합니다. 항상 FF ≤ TF 입니다.",
      "독립여유 IF = TE(j) − TL(i) − D 는 선행이 최지로 끝나고 후행이 최대로 빨리 시작해도 남는 여유입니다. 음수가 나오면 0으로 보는 경우가 많습니다.",
    ],
    formula: "TF = TL(j) − TE(i) − D = LS − ES = LF − EF\nFF = TE(j) − TE(i) − D\nIF = TE(j) − TL(i) − D",
  },
  {
    id: "crash",
    title: "주공정선과 공기 단축",
    body: [
      "주공정선은 TF = 0인 작업만 이은 경로입니다. 어느 하나를 늦추면 공기가 늘어납니다.",
      "공기를 줄이려면 주공정 작업의 기간을 줄여야 합니다(crash). 비주공정만 줄이면 TF만 늘고 공기는 그대로입니다.",
      "단축 후에는 네트워크를 다시 풀어 새로운 주공정·여유를 확인합니다. 단축비가 싼 주공정 작업부터 고르는 문제가 응용으로 나옵니다.",
    ],
  },
];

const CPM_PROBLEMS = [
  {
    id: "basic",
    title: "기본 네트워크",
    level: "입문",
    brief: "더미 없이 TE·TL과 여유시간을 채웁니다. 공기는 9일입니다.",
    activities: [
      { name: "A", from: 1, to: 2, duration: 3 },
      { name: "B", from: 1, to: 3, duration: 2 },
      { name: "C", from: 2, to: 3, duration: 4 },
      { name: "D", from: 2, to: 4, duration: 5 },
      { name: "E", from: 3, to: 4, duration: 2 },
    ],
  },
  {
    id: "dummy",
    title: "더미가 있는 네트워크",
    level: "핵심",
    brief: "점선 더미는 기간 0입니다. 선후 제약만 잇고, 주공정에 포함될 수 있습니다.",
    activities: [
      { name: "A", from: 1, to: 2, duration: 5 },
      { name: "B", from: 1, to: 3, duration: 3 },
      { name: "C", from: 2, to: 4, duration: 4 },
      { name: "D", from: 3, to: 4, duration: 6 },
      { name: "Dummy", from: 2, to: 3, duration: 0, dummy: true },
    ],
  },
  {
    id: "exam",
    title: "기사형 네트워크",
    level: "실전",
    brief: "작업이 늘어난 형태입니다. 공기는 15일, 주공정은 A-D-G 입니다.",
    activities: [
      { name: "A", from: 1, to: 2, duration: 4 },
      { name: "B", from: 1, to: 3, duration: 2 },
      { name: "C", from: 2, to: 3, duration: 3 },
      { name: "D", from: 2, to: 4, duration: 5 },
      { name: "E", from: 3, to: 5, duration: 4 },
      { name: "F", from: 4, to: 5, duration: 2 },
      { name: "G", from: 4, to: 6, duration: 6 },
      { name: "H", from: 5, to: 6, duration: 3 },
    ],
  },
];

const CPM_QUIZ = [
  {
    q: "CPM에서 프로젝트 공기는 무엇으로 정하는가?",
    choices: [
      "모든 작업 기간의 합",
      "최단 경로의 기간 합",
      "마지막 결합점의 최초시각 TE(끝)",
      "더미 작업 개수",
    ],
    answer: 2,
  },
  {
    q: "주공정 작업의 총여유시간 TF는?",
    choices: ["항상 1", "0", "자유여유보다 반드시 작다", "음수"],
    answer: 1,
  },
  {
    q: "작업 i-j의 총여유 TF 공식으로 옳은 것은?",
    choices: ["TE(i) + D", "TL(j) − TE(i) − D", "TE(j) + TL(i)", "LS + LF"],
    answer: 1,
  },
  {
    q: "자유여유 FF의 의미로 가장 가까운 것은?",
    choices: [
      "공기를 밀지 않는 최대 지연",
      "후행 작업의 최초시작을 밀지 않는 여유",
      "비용 단축량",
      "더미의 기간",
    ],
    answer: 1,
  },
  {
    q: "더미(가상작업)에 대한 설명으로 옳은 것은?",
    choices: [
      "기간을 임의로 정한다",
      "실제 작업이며 노무비가 든다",
      "기간 0으로 선후관계만 표시한다",
      "항상 주공정에 들어간다",
    ],
    answer: 2,
  },
  {
    q: "전진계산에서 한 결합점의 TE는?",
    choices: [
      "들어오는 작업 EF의 최댓값",
      "나가는 작업 LS의 최솟값",
      "모든 TF의 합",
      "항상 0",
    ],
    answer: 0,
  },
  {
    q: "후진계산에서 한 결합점의 TL은?",
    choices: [
      "들어오는 EF의 최댓값",
      "나가는 작업 (TL(j) − D)의 최솟값",
      "TE와 항상 같다",
      "작업 개수",
    ],
    answer: 1,
  },
  {
    q: "공기를 줄이려면 우선 무엇을 단축해야 하는가?",
    choices: ["여유 있는 비주공정", "주공정 작업의 기간", "더미만", "후진계산만"],
    answer: 1,
  },
  {
    q: "기본 네트워크(A3, B2, C4, D5, E2)의 공기와 주공정은?",
    choices: ["7일, B-E", "8일, A-D", "9일, A-C-E", "11일, A-C-D"],
    answer: 2,
  },
  {
    q: "FF ≤ TF 가 항상 성립하는 이유로 가장 가까운 것은?",
    choices: [
      "TE(j) ≤ TL(j) 이므로 FF = TE(j)−TE(i)−D ≤ TL(j)−TE(i)−D = TF",
      "더미가 없어서",
      "주공정만 계산하므로",
      "LS가 항상 0이므로",
    ],
    answer: 0,
  },
];
