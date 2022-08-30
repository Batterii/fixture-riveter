"use strict";(self.webpackChunkfixture_riveter=self.webpackChunkfixture_riveter||[]).push([[128],{3448:(n,s,a)=>{a.r(s),a.d(s,{data:()=>t});const t={key:"v-c28344cc",path:"/guide/using-fixtures.html",title:"Using fixtures",lang:"en-US",frontmatter:{},excerpt:"",headers:[{level:2,title:"Changing build strategies of relations",slug:"changing-build-strategies-of-relations",children:[]}],filePathRelative:"guide/using-fixtures.md"}},8702:(n,s,a)=>{a.r(s),a.d(s,{default:()=>p});const t=(0,a(6252).uE)('<h1 id="using-fixtures" tabindex="-1"><a class="header-anchor" href="#using-fixtures" aria-hidden="true">#</a> Using fixtures</h1><p>A defined fixture can be instanced by calling one of the strategies (by default: <code>attributesFor</code>, <code>build</code>, <code>create</code>):</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code><span class="token comment">// This will create a plain javascript object with all of the defined attributes</span>\n<span class="token keyword">const</span> post <span class="token operator">=</span> <span class="token keyword">await</span> fr<span class="token punctuation">.</span><span class="token function">attributesFor</span><span class="token punctuation">(</span><span class="token string">&quot;post&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token comment">// This will instantiate the class Post and assign all defined attributes onto it</span>\n<span class="token keyword">const</span> post <span class="token operator">=</span> <span class="token keyword">await</span> fr<span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token string">&quot;post&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token comment">// This will:</span>\n<span class="token comment">// * instantiate the class Post</span>\n<span class="token comment">// * assign all defined attributes as build does</span>\n<span class="token comment">// * then save the instance to the database, according to the `save`</span>\n<span class="token comment">//   function in the chosen adapter</span>\n<span class="token keyword">const</span> post <span class="token operator">=</span> <span class="token keyword">await</span> fr<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token string">&quot;post&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>Regardless of which strategy is used, the defined attributes can be overridden by passing in an object as the final argument:</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code><span class="token keyword">const</span> post <span class="token operator">=</span> <span class="token keyword">await</span> fr<span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token string">&quot;post&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>title<span class="token operator">:</span> <span class="token string">&quot;The best post in the universe&quot;</span><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\npost<span class="token punctuation">.</span>title\n<span class="token comment">// =&gt; &quot;The best post in the universe&quot;</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>As with fixture definitions, the fixture name can instead be the desired class, following the same logic as for definitions (static <code>tableName</code> or <code>name</code> property on the class):</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code><span class="token keyword">const</span> post <span class="token operator">=</span> <span class="token keyword">await</span> fr<span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span>Post<span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br></div></div><p>These can be mixed, as long as care is taken to watch for class name munging and any differences between the given fixture name string and the name as set in the definition:</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code><span class="token keyword">class</span> <span class="token class-name">User</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>\n\nfr<span class="token punctuation">.</span><span class="token function">fixture</span><span class="token punctuation">(</span>User<span class="token punctuation">,</span> <span class="token operator">...</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token keyword">const</span> user <span class="token operator">=</span> <span class="token keyword">await</span> fr<span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token string">&quot;User&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// not &quot;user&quot;</span>\nuser <span class="token keyword">instanceof</span> <span class="token class-name">User</span>\n<span class="token comment">// true</span>\n\n<span class="token keyword">class</span> <span class="token class-name">Post</span> <span class="token punctuation">{</span>\n    <span class="token keyword">static</span> tableName <span class="token operator">=</span> <span class="token string">&quot;posts&quot;</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n\nfr<span class="token punctuation">.</span><span class="token function">fixture</span><span class="token punctuation">(</span><span class="token string">&quot;posts&quot;</span><span class="token punctuation">,</span> Post<span class="token punctuation">,</span> <span class="token operator">...</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// has to match tableName here</span>\n\n<span class="token keyword">const</span> post <span class="token operator">=</span> <span class="token keyword">await</span> fr<span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span>Post<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// to be matched here</span>\npost <span class="token keyword">instanceof</span> <span class="token class-name">Post</span>\n<span class="token comment">// true</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><h2 id="changing-build-strategies-of-relations" tabindex="-1"><a class="header-anchor" href="#changing-build-strategies-of-relations" aria-hidden="true">#</a> Changing build strategies of relations</h2><p>By default, relations are build with the same strategy as their parent object:</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code>fr<span class="token punctuation">.</span><span class="token function">fixture</span><span class="token punctuation">(</span><span class="token string">&quot;post&quot;</span><span class="token punctuation">,</span> Post<span class="token punctuation">,</span> <span class="token operator">...</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\nfr<span class="token punctuation">.</span><span class="token function">fixture</span><span class="token punctuation">(</span><span class="token string">&quot;user&quot;</span><span class="token punctuation">,</span> User<span class="token punctuation">,</span> <span class="token punctuation">(</span>f<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n    f<span class="token punctuation">.</span><span class="token function">attr</span><span class="token punctuation">(</span><span class="token string">&quot;post&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token keyword">const</span> user <span class="token operator">=</span> <span class="token keyword">await</span> fr<span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token string">&quot;user&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\nuser<span class="token punctuation">.</span>id <span class="token operator">===</span> <span class="token keyword">undefined</span><span class="token punctuation">;</span>\n<span class="token comment">// true</span>\nuser<span class="token punctuation">.</span>post<span class="token punctuation">.</span>id <span class="token operator">===</span> <span class="token keyword">undefined</span><span class="token punctuation">;</span>\n<span class="token comment">// true</span>\n\n<span class="token keyword">const</span> savedUser <span class="token operator">=</span> <span class="token keyword">await</span> fr<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token string">&quot;user&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\nsavedUser<span class="token punctuation">.</span>id <span class="token operator">===</span> <span class="token keyword">undefined</span><span class="token punctuation">;</span>\n<span class="token comment">// false</span>\nsavedUser<span class="token punctuation">.</span>post<span class="token punctuation">.</span>id <span class="token operator">===</span> <span class="token keyword">undefined</span><span class="token punctuation">;</span>\n<span class="token comment">// false</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>If you want to have all relations use the <code>create</code> strategy instead, you can set the global flag <code>fr.useParentStrategy</code> to false:</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code>fr<span class="token punctuation">.</span>useParentStrategy <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>\nfr<span class="token punctuation">.</span><span class="token function">fixture</span><span class="token punctuation">(</span><span class="token string">&quot;post&quot;</span><span class="token punctuation">,</span> Post<span class="token punctuation">,</span> <span class="token operator">...</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\nfr<span class="token punctuation">.</span><span class="token function">fixture</span><span class="token punctuation">(</span><span class="token string">&quot;user&quot;</span><span class="token punctuation">,</span> User<span class="token punctuation">,</span> <span class="token punctuation">(</span>f<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n    f<span class="token punctuation">.</span><span class="token function">attr</span><span class="token punctuation">(</span><span class="token string">&quot;post&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token keyword">const</span> user <span class="token operator">=</span> <span class="token keyword">await</span> fr<span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token string">&quot;user&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\nuser<span class="token punctuation">.</span>id <span class="token operator">===</span> <span class="token keyword">undefined</span><span class="token punctuation">;</span>\n<span class="token comment">// true</span>\nuser<span class="token punctuation">.</span>post<span class="token punctuation">.</span>id <span class="token operator">===</span> <span class="token keyword">undefined</span><span class="token punctuation">;</span>\n<span class="token comment">// false</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>If you want to specify the strategy used in a relation, use the <code>{strategy: build}</code> option in the attribute definition:</p><div class="language-typescript ext-ts line-numbers-mode"><pre class="language-typescript"><code>fr<span class="token punctuation">.</span><span class="token function">fixture</span><span class="token punctuation">(</span><span class="token string">&quot;post&quot;</span><span class="token punctuation">,</span> Post<span class="token punctuation">,</span> <span class="token operator">...</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\nfr<span class="token punctuation">.</span><span class="token function">fixture</span><span class="token punctuation">(</span><span class="token string">&quot;user&quot;</span><span class="token punctuation">,</span> User<span class="token punctuation">,</span> <span class="token punctuation">(</span>f<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n    f<span class="token punctuation">.</span><span class="token function">relation</span><span class="token punctuation">(</span><span class="token string">&quot;post&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>strategy<span class="token operator">:</span> <span class="token string">&quot;build&quot;</span><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token keyword">const</span> user <span class="token operator">=</span> <span class="token keyword">await</span> fr<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token string">&quot;user&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\nuser<span class="token punctuation">.</span>id <span class="token operator">===</span> <span class="token keyword">undefined</span><span class="token punctuation">;</span>\n<span class="token comment">// false</span>\nuser<span class="token punctuation">.</span>post<span class="token punctuation">.</span>id <span class="token operator">===</span> <span class="token keyword">undefined</span><span class="token punctuation">;</span>\n<span class="token comment">// true</span>\n</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div>',16),p={render:function(n,s){return t}}}}]);