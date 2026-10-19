const app = document.getElementById("app");

function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const parts = raw.split("/").filter(Boolean);
  return { parts, path: "/" + parts.join("/") };
}

function navActive() {
  const { parts } = parseHash();
  const key = parts[0] || "";
  document.querySelectorAll(".nav a").forEach((a) => {
    const href = a.getAttribute("href");
    const isHome = href === "#/" && !key;
    const isMatch = key && href === `#/${key}`;
    a.classList.toggle("active", isHome || isMatch);
  });
}

function homeView() {
  return `
    <section class="hero">
      <div>
        <div class="kicker">ARCHITECTURE ENGINEERING</div>
        <h1>누구나 배우는<br/>건축공학</h1>
        <p class="lead">
          구조·재료와 함께, 건축기사 시공에서 반복되는 <strong>CPM(주공정법)</strong>을
          네트워크 계산 실습으로 익힙니다.
        </p>
        <p>
          <a class="btn" href="#/cpm/walk/basic" data-link>CPM 따라 계산하기</a>
          <a class="btn ghost" href="#/cpm" data-link>학습 프로그램</a>
        </p>
      </div>
      <div class="hero-card">
        <h3>건축기사 · 주공정법</h3>
        <p class="lead" style="font-size:15px">TE·TL → ES/EF/LS/LF → TF·FF → 주공정선</p>
        <div class="stat-row">
          <div class="stat"><b>${CPM_THEORY.length}</b><span>개념 강의</span></div>
          <div class="stat"><b>${CPM_PROBLEMS.length}</b><span>네트워크 실습</span></div>
          <div class="stat"><b>${CPM_QUIZ.length}</b><span>기사형 문제</span></div>
        </div>
      </div>
    </section>
    <div class="section-head">
      <h2>CPM 실습 문제</h2>
      <a href="#/cpm" data-link>프로그램 홈</a>
    </div>
    <div class="cards">
      ${CPM_PROBLEMS.map(problemCard).join("")}
    </div>
    <div class="section-head">
      <h2>기초 과목</h2>
      <a href="#/curriculum" data-link>전체 보기</a>
    </div>
    <div class="cards">
      ${COURSES.slice(0, 4).map(courseCard).join("")}
    </div>
  `;
}

function courseCard(c) {
  const first = c.lessons[0];
  return `
    <a class="card" href="#/lesson/${c.id}/${first.id}" data-link>
      <span class="badge">${c.level}</span>
      <h3>${c.title}</h3>
      <p>${c.summary}</p>
    </a>
  `;
}

function problemCard(p) {
  return `
    <a class="card" href="#/cpm/walk/${p.id}" data-link>
      <span class="badge">${p.level}</span>
      <h3>${p.title}</h3>
      <p>${p.brief}</p>
    </a>
  `;
}

function curriculumView() {
  return `
    <div class="kicker">CURRICULUM</div>
    <h1>커리큘럼</h1>
    <p class="lead">기사 CPM과 건축공학 입문을 함께 둡니다.</p>
    <div class="cards">
      <a class="card" href="#/cpm" data-link>
        <span class="badge">기사</span>
        <h3>CPM 주공정법</h3>
        <p>화살선식 네트워크, 여유시간, 주공정선 계산 실습.</p>
      </a>
      ${COURSES.map(courseCard).join("")}
    </div>
  `;
}

function findCourse(id) {
  return COURSES.find((c) => c.id === id);
}

function lessonView(courseId, lessonId) {
  const course = findCourse(courseId);
  if (!course) return `<p>과목을 찾을 수 없습니다.</p>`;
  const lesson = course.lessons.find((l) => l.id === lessonId) || course.lessons[0];
  const idx = course.lessons.findIndex((l) => l.id === lesson.id);
  const prev = course.lessons[idx - 1];
  const next = course.lessons[idx + 1];

  return `
    <div class="lesson-layout">
      <aside class="side">
        <div class="kicker">${course.level}</div>
        <h3>${course.title}</h3>
        ${course.lessons
          .map(
            (l) =>
              `<a href="#/lesson/${course.id}/${l.id}" data-link class="${l.id === lesson.id ? "active" : ""}">${l.title}</a>`
          )
          .join("")}
      </aside>
      <article class="article">
        <div class="kicker">LESSON</div>
        <h1>${lesson.title}</h1>
        ${lesson.body.map((p) => `<p>${p}</p>`).join("")}
        ${lesson.formula ? `<div class="formula">${lesson.formula}</div>` : ""}
        <p style="margin-top:28px; display:flex; gap:10px; flex-wrap:wrap">
          ${prev ? `<a class="btn ghost" href="#/lesson/${course.id}/${prev.id}" data-link>이전: ${prev.title}</a>` : ""}
          ${next ? `<a class="btn" href="#/lesson/${course.id}/${next.id}" data-link>다음: ${next.title}</a>` : `<a class="btn" href="#/cpm" data-link>CPM으로</a>`}
        </p>
      </article>
    </div>
  `;
}

function glossaryView() {
  return `
    <div class="kicker">GLOSSARY</div>
    <h1>용어사전</h1>
    ${GLOSSARY.map((g) => `<div class="term"><h3>${g.term}</h3><p>${g.def}</p></div>`).join("")}
  `;
}

function quizView() {
  return quizBlock("연습문제", QUIZ);
}

function quizBlock(title, items, attr = "data-quiz") {
  return `
    <div class="kicker">QUIZ</div>
    <h1>${title}</h1>
    <p class="lead">답을 고르면 바로 채점됩니다. 다시 누르면 초기화됩니다.</p>
    ${items
      .map(
        (item, i) => `
      <div class="quiz-item" ${attr}="${i}">
        <strong>${i + 1}. ${item.q}</strong>
        <div class="options">
          ${item.choices
            .map((c, j) => `<button type="button" data-choice="${j}">${c}</button>`)
            .join("")}
        </div>
      </div>`
      )
      .join("")}
  `;
}

function cpmHub() {
  return `
    <div class="kicker">건축기사 · 시공</div>
    <h1>CPM 주공정법</h1>
    <p class="lead">학생용 순서: 공식 치트시트 → 따라 계산하기 → 표 채점 → 공기 단축 → 객관식. 결합점 숫자를 가린 채 손계산하는 습관을 만듭니다.</p>
    <p>
      <a class="btn" href="#/cpm/walk/basic" data-link>따라 계산하기</a>
      <a class="btn ghost" href="#/cpm/practice/basic" data-link>표 채점 실습</a>
      <a class="btn ghost" href="#/cpm/crash/basic" data-link>공기 단축</a>
      <a class="btn ghost" href="#/cpm/lab" data-link>계산기</a>
    </p>
    <div class="cheat">
      <div><b>전진</b>TE(j) = max(TE(i)+D)<br/>ES=TE(i), EF=ES+D</div>
      <div><b>후진</b>TL(i) = min(TL(j)−D)<br/>LF=TL(j), LS=LF−D</div>
      <div><b>여유</b>TF = TL(j)−TE(i)−D<br/>FF = TE(j)−TE(i)−D · 주공정은 TF=0</div>
    </div>
    <div class="section-head"><h2>개념</h2></div>
    <div class="cards">
      ${CPM_THEORY.map(
        (t) => `
        <a class="card" href="#/cpm/learn/${t.id}" data-link>
          <span class="badge">강의</span>
          <h3>${t.title}</h3>
          <p>${t.body[0].slice(0, 72)}…</p>
        </a>`
      ).join("")}
    </div>
    <div class="section-head"><h2>실습 네트워크</h2></div>
    <div class="cards">${CPM_PROBLEMS.map(problemCard).join("")}</div>
    <p style="margin-top:28px"><a class="btn" href="#/cpm/quiz" data-link>기사형 객관식</a></p>
  `;
}

function cpmLearn(id) {
  const lesson = CPM_THEORY.find((t) => t.id === id) || CPM_THEORY[0];
  const idx = CPM_THEORY.findIndex((t) => t.id === lesson.id);
  const prev = CPM_THEORY[idx - 1];
  const next = CPM_THEORY[idx + 1];
  return `
    <div class="lesson-layout">
      <aside class="side">
        <div class="kicker">CPM</div>
        <h3>개념 강의</h3>
        ${CPM_THEORY.map(
          (t) =>
            `<a href="#/cpm/learn/${t.id}" data-link class="${t.id === lesson.id ? "active" : ""}">${t.title}</a>`
        ).join("")}
        <a href="#/cpm/walk/basic" data-link>따라 계산하기</a>
        <a href="#/cpm/practice/basic" data-link>표 채점</a>
        <a href="#/cpm/crash/basic" data-link>공기 단축</a>
      </aside>
      <article class="article">
        <div class="kicker">LESSON</div>
        <h1>${lesson.title}</h1>
        ${lesson.body.map((p) => `<p>${p}</p>`).join("")}
        ${lesson.formula ? `<div class="formula">${lesson.formula.replace(/\n/g, "<br/>")}</div>` : ""}
        <p style="margin-top:28px; display:flex; gap:10px; flex-wrap:wrap">
          ${prev ? `<a class="btn ghost" href="#/cpm/learn/${prev.id}" data-link>이전</a>` : ""}
          ${next ? `<a class="btn" href="#/cpm/learn/${next.id}" data-link>다음: ${next.title}</a>` : `<a class="btn" href="#/cpm/practice/basic" data-link>실습 시작</a>`}
        </p>
      </article>
    </div>
  `;
}

const walkUi = { id: null, step: 0 };
const practiceUi = { id: null, reveal: false };
const crashUi = { id: null, cuts: {} };

function problemBy(id) {
  return CPM_PROBLEMS.find((p) => p.id === id) || CPM_PROBLEMS[0];
}

function cpmWalk(id) {
  const problem = problemBy(id);
  if (walkUi.id !== problem.id) {
    walkUi.id = problem.id;
    walkUi.step = 0;
  }
  const { solved, steps } = buildWalkthrough(problem);
  const last = steps.length - 1;
  walkUi.step = Math.max(0, Math.min(last, walkUi.step));
  const s = steps[walkUi.step];
  const pct = Math.round(((walkUi.step + 1) / steps.length) * 100);
  const idx = CPM_PROBLEMS.findIndex((p) => p.id === problem.id);
  const nextP = CPM_PROBLEMS[idx + 1];
  return `
    <div id="cpm-walk" data-id="${problem.id}">
      <div class="kicker">${problem.level} · 따라 계산하기</div>
      <h1>${problem.title}</h1>
      <p class="lead">한 단계씩 전진 → 공기 → 후진 → 작업 여유 → 주공정 순입니다. 결합점 숫자는 해당 단계가 되어야 열립니다.</p>
      <div class="walk-meta">
        <span>${walkUi.step + 1} / ${steps.length} · ${s.title}</span>
        <span>
          ${CPM_PROBLEMS.map(
            (p) =>
              `<a href="#/cpm/walk/${p.id}" data-link class="${p.id === problem.id ? "active" : ""}">${p.title}</a>`
          ).join(" · ")}
        </span>
      </div>
      <div class="progress"><span style="width:${pct}%"></span></div>
      <div class="net-panel">${cpmSvg(solved, s)}</div>
      <div class="walk-card">${s.html}</div>
      <p style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
        <button type="button" class="btn ghost" id="walk-prev">이전 단계</button>
        <button type="button" class="btn" id="walk-next">${walkUi.step === last ? "실습으로" : "다음 단계"}</button>
        ${nextP && walkUi.step === last ? `<a class="btn ghost" href="#/cpm/walk/${nextP.id}" data-link>다음 네트워크</a>` : ""}
      </p>
    </div>
  `;
}

function cpmPractice(id) {
  const problem = problemBy(id);
  if (practiceUi.id !== problem.id) {
    practiceUi.id = problem.id;
    practiceUi.reveal = false;
  }
  const solved = solveCpm(problem.activities);
  const idx = CPM_PROBLEMS.findIndex((p) => p.id === problem.id);
  const next = CPM_PROBLEMS[idx + 1];
  const prev = CPM_PROBLEMS[idx - 1];
  const shown = practiceUi.reveal ? "all" : [];
  return `
    <div class="kicker">${problem.level}</div>
    <h1>${problem.title}</h1>
    <p class="lead">${problem.brief} 공기와 주공정선을 구한 뒤, 표에 ES·EF·LS·LF·TF·FF를 넣고 채점하세요. 기본은 결합점 숫자를 가립니다.</p>
    <div class="net-panel">${cpmSvg(solved, { revealTE: shown, revealTL: shown, showCrit: practiceUi.reveal })}</div>
    <div class="hint-bar">
      <span>끝 결합점 개수 ${solved.ids.length}개 · 작업 ${solved.rows.length}개</span>
      <button type="button" class="btn ghost" id="cpm-toggle-nodes">${practiceUi.reveal ? "결합점 숨기기" : "결합점 TE/TL 보기"}</button>
      <button type="button" class="btn ghost" id="cpm-reveal">정답 채우기</button>
      <button type="button" class="btn" id="cpm-check">채점</button>
      <a class="btn ghost" href="#/cpm/walk/${problem.id}" data-link>따라 계산</a>
    </div>
    <div class="table-wrap">
      <table class="cpm-table" id="cpm-sheet" data-problem="${problem.id}">
        <thead>
          <tr>
            <th>작업</th><th>i-j</th><th>D</th>
            <th>ES</th><th>EF</th><th>LS</th><th>LF</th><th>TF</th><th>FF</th>
          </tr>
        </thead>
        <tbody>
          ${solved.rows
            .map(
              (r, i) => `
            <tr data-row="${i}" class="${r.critical && practiceUi.reveal ? "is-crit" : ""}">
              <td>${r.name}</td>
              <td>${r.from}-${r.to}</td>
              <td>${r.duration}</td>
              ${["es", "ef", "ls", "lf", "tf", "ff"]
                .map(
                  (k) =>
                    `<td><input inputmode="numeric" data-k="${k}" data-ans="${r[k]}" aria-label="${r.name} ${k}"></td>`
                )
                .join("")}
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <p id="cpm-result" class="lead"></p>
    <p style="display:flex;gap:10px;flex-wrap:wrap">
      ${prev ? `<a class="btn ghost" href="#/cpm/practice/${prev.id}" data-link>이전 문제</a>` : `<a class="btn ghost" href="#/cpm/learn/float" data-link>여유시간 강의</a>`}
      ${next ? `<a class="btn" href="#/cpm/practice/${next.id}" data-link>다음 문제</a>` : `<a class="btn" href="#/cpm/quiz" data-link>객관식</a>`}
    </p>
  `;
}

function crashedActivities(problem) {
  return problem.activities.map((a) => {
    const cut = crashUi.cuts[a.name] || 0;
    const duration = Math.max(a.dummy ? 0 : 1, a.duration - cut);
    return { ...a, duration };
  });
}

function cpmCrash(id) {
  const problem = problemBy(id);
  if (crashUi.id !== problem.id) {
    crashUi.id = problem.id;
    crashUi.cuts = {};
  }
  const base = solveCpm(problem.activities);
  const now = solveCpm(crashedActivities(problem));
  const saved = base.project - now.project;
  return `
    <div id="cpm-crash" data-id="${problem.id}">
      <div class="kicker">CRASH</div>
      <h1>공기 단축 실험 · ${problem.title}</h1>
      <p class="lead">주공정 작업을 하루 줄이면 공기가 줄어듭니다. 비주공정만 줄이면 공기는 그대로입니다. 최소 기간은 1일(더미는 0)입니다.</p>
      <p><strong>원래 공기 ${base.project}일</strong> → 지금 <strong>${now.project}일</strong> (${saved > 0 ? `${saved}일 단축` : "단축 없음"})</p>
      <div class="crash-btns">
        ${problem.activities
          .map((a) => {
            const cut = crashUi.cuts[a.name] || 0;
            return `<button type="button" class="btn ghost" data-crash="${a.name}">${a.name} −1일 (현재 −${cut})</button>`;
          })
          .join("")}
        <button type="button" class="btn" id="crash-reset">원위치</button>
      </div>
      <div class="net-panel">${cpmSvg(now)}</div>
      ${renderLab(crashedActivities(problem), false)}
    </div>
  `;
}

function cpmLab() {
  return `
    <div class="kicker">CALCULATOR</div>
    <h1>네트워크 계산기</h1>
    <p class="lead">화살선식 작업을 입력하면 TE·TL과 여유시간, 주공정선을 계산합니다. 더미는 기간 0으로 넣으세요.</p>
    <form id="cpm-lab" class="lab-form">
      <div class="table-wrap">
        <table class="cpm-table">
          <thead><tr><th>작업명</th><th>시작 i</th><th>종료 j</th><th>기간 D</th></tr></thead>
          <tbody id="lab-rows">
            <tr><td><input name="name" value="A" required></td><td><input name="from" value="1" required></td><td><input name="to" value="2" required></td><td><input name="dur" value="3" required></td></tr>
            <tr><td><input name="name" value="B"></td><td><input name="from" value="1"></td><td><input name="to" value="3"></td><td><input name="dur" value="2"></td></tr>
            <tr><td><input name="name" value="C"></td><td><input name="from" value="2"></td><td><input name="to" value="3"></td><td><input name="dur" value="4"></td></tr>
            <tr><td><input name="name" value="D"></td><td><input name="from" value="2"></td><td><input name="to" value="4"></td><td><input name="dur" value="5"></td></tr>
            <tr><td><input name="name" value="E"></td><td><input name="from" value="3"></td><td><input name="to" value="4"></td><td><input name="dur" value="2"></td></tr>
          </tbody>
        </table>
      </div>
      <p>
        <button type="button" class="btn ghost" id="lab-add">작업 추가</button>
        <button type="submit" class="btn">계산</button>
      </p>
    </form>
    <div id="lab-out"></div>
  `;
}

function renderLab(activities, withSvg = true) {
  const solved = solveCpm(activities);
  const path = solved.rows
    .filter((r) => r.critical)
    .map((r) => `${r.name}(${r.from}-${r.to})`)
    .join(" → ");
  return `
    ${withSvg ? cpmSvg(solved) : ""}
    <p><strong>공기 ${solved.project}</strong> · 주공정: ${path || "없음"}</p>
    <div class="table-wrap">
      <table class="cpm-table">
        <thead><tr><th>작업</th><th>i-j</th><th>D</th><th>ES</th><th>EF</th><th>LS</th><th>LF</th><th>TF</th><th>FF</th></tr></thead>
        <tbody>
          ${solved.rows
            .map(
              (r) =>
                `<tr class="${r.critical ? "is-crit" : ""}"><td>${r.name}</td><td>${r.from}-${r.to}</td><td>${r.duration}</td><td>${r.es}</td><td>${r.ef}</td><td>${r.ls}</td><td>${r.lf}</td><td>${r.tf}</td><td>${r.ff}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function bindCpmWalk() {
  const root = document.getElementById("cpm-walk");
  if (!root) return;
  const id = root.dataset.id;
  const { steps } = buildWalkthrough(problemBy(id));
  const paint = () => {
    app.innerHTML = cpmWalk(id);
    bindCpmWalk();
  };
  document.getElementById("walk-prev")?.addEventListener("click", () => {
    walkUi.step = Math.max(0, walkUi.step - 1);
    paint();
  });
  document.getElementById("walk-next")?.addEventListener("click", () => {
    if (walkUi.step >= steps.length - 1) {
      location.hash = `#/cpm/practice/${id}`;
      return;
    }
    walkUi.step += 1;
    paint();
  });
}

function bindCpmCrash() {
  const root = document.getElementById("cpm-crash");
  if (!root) return;
  const id = root.dataset.id;
  const paint = () => {
    app.innerHTML = cpmCrash(id);
    bindCpmCrash();
  };
  document.getElementById("crash-reset")?.addEventListener("click", () => {
    crashUi.cuts = {};
    paint();
  });
  root.querySelectorAll("[data-crash]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-crash");
      crashUi.cuts[name] = (crashUi.cuts[name] || 0) + 1;
      paint();
    });
  });
}

function bindCpmPractice() {
  const sheet = document.getElementById("cpm-sheet");
  if (!sheet) return;
  const result = document.getElementById("cpm-result");
  document.getElementById("cpm-toggle-nodes")?.addEventListener("click", () => {
    practiceUi.reveal = !practiceUi.reveal;
    const values = [...sheet.querySelectorAll("input")].map((i) => i.value);
    app.innerHTML = cpmPractice(sheet.dataset.problem);
    bindCpmPractice();
    document.querySelectorAll("#cpm-sheet input").forEach((inp, i) => {
      inp.value = values[i] || "";
    });
  });
  document.getElementById("cpm-reveal")?.addEventListener("click", () => {
    sheet.querySelectorAll("input[data-ans]").forEach((inp) => {
      inp.value = inp.dataset.ans;
      inp.classList.remove("bad", "ok");
    });
    result.textContent = "정답을 채워 두었습니다. 주공정 행은 금색 왼쪽 선입니다.";
  });
  document.getElementById("cpm-check")?.addEventListener("click", () => {
    let ok = 0;
    let total = 0;
    sheet.querySelectorAll("input[data-ans]").forEach((inp) => {
      total += 1;
      const v = Number(String(inp.value).trim());
      const ans = Number(inp.dataset.ans);
      const good = inp.value !== "" && v === ans;
      inp.classList.toggle("ok", good);
      inp.classList.toggle("bad", !good);
      if (good) ok += 1;
    });
    result.textContent = `${ok} / ${total} 칸 정답. 주공정은 TF = 0 인 작업입니다.`;
  });
}

function bindCpmLab() {
  const form = document.getElementById("cpm-lab");
  if (!form) return;
  const tbody = document.getElementById("lab-rows");
  document.getElementById("lab-add")?.addEventListener("click", () => {
    const tr = document.createElement("tr");
    tr.innerHTML =
      `<td><input name="name" placeholder="F"></td><td><input name="from"></td><td><input name="to"></td><td><input name="dur"></td>`;
    tbody.appendChild(tr);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const rows = [...tbody.querySelectorAll("tr")];
    const activities = rows
      .map((tr) => {
        const [name, from, to, dur] = [...tr.querySelectorAll("input")].map((i) => i.value.trim());
        if (!from || !to || dur === "") return null;
        const duration = Number(dur);
        return {
          name: name || `${from}-${to}`,
          from: Number(from),
          to: Number(to),
          duration,
          dummy: duration === 0,
        };
      })
      .filter(Boolean);
    const out = document.getElementById("lab-out");
    if (activities.length === 0) {
      out.innerHTML = "<p>작업을 한 줄 이상 입력하세요.</p>";
      return;
    }
    try {
      out.innerHTML = renderLab(activities);
    } catch (err) {
      out.innerHTML = `<p>계산할 수 없습니다. 결합점 번호와 선후를 확인하세요.</p>`;
    }
  });
}

function render() {
  const { parts } = parseHash();
  const [a, b, c] = parts;
  if (!a) app.innerHTML = homeView();
  else if (a === "curriculum") app.innerHTML = curriculumView();
  else if (a === "glossary") app.innerHTML = glossaryView();
  else if (a === "quiz") app.innerHTML = quizView();
  else if (a === "lesson") app.innerHTML = lessonView(b, c);
  else if (a === "cpm" && !b) app.innerHTML = cpmHub();
  else if (a === "cpm" && b === "learn") app.innerHTML = cpmLearn(c);
  else if (a === "cpm" && b === "practice") app.innerHTML = cpmPractice(c);
  else if (a === "cpm" && b === "quiz") app.innerHTML = quizBlock("CPM 기사형 문제", CPM_QUIZ, "data-cpm-quiz");
  else if (a === "cpm" && b === "lab") app.innerHTML = cpmLab();
  else if (a === "cpm" && b === "walk") app.innerHTML = cpmWalk(c);
  else if (a === "cpm" && b === "crash") app.innerHTML = cpmCrash(c);
  else app.innerHTML = homeView();
  navActive();
  window.scrollTo(0, 0);
  bindCpmPractice();
  bindCpmLab();
  bindCpmWalk();
  bindCpmCrash();
}

function gradeQuiz(btn, bank) {
  const box = btn.closest("[data-quiz], [data-cpm-quiz]");
  if (!box) return;
  const qi = Number(box.getAttribute("data-quiz") ?? box.getAttribute("data-cpm-quiz"));
  const choice = Number(btn.dataset.choice);
  const item = bank[qi];
  const buttons = [...box.querySelectorAll("[data-choice]")];
  const already = buttons.some((b) => b.classList.contains("correct") || b.classList.contains("wrong"));
  if (already) {
    buttons.forEach((b) => b.classList.remove("correct", "wrong"));
    return;
  }
  buttons.forEach((b, j) => {
    if (j === item.answer) b.classList.add("correct");
    if (j === choice && choice !== item.answer) b.classList.add("wrong");
  });
}

document.addEventListener("click", (e) => {
  const cpmBtn = e.target.closest("[data-cpm-quiz] [data-choice]");
  if (cpmBtn) {
    gradeQuiz(cpmBtn, CPM_QUIZ);
    return;
  }
  const btn = e.target.closest("[data-quiz] [data-choice]");
  if (btn) gradeQuiz(btn, QUIZ);
});

window.addEventListener("hashchange", render);
if (!location.hash) location.hash = "#/";
else render();
