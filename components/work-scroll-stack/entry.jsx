import React from 'react';
import { createRoot } from 'react-dom/client';
import ScrollStack, { ScrollStackItem } from './ScrollStack.jsx';
import './editorial.css';
import { projects } from './projects.js';

const mount = document.querySelector('#work [data-scroll-stack]');
if (mount) {
  createRoot(mount).render(
    <ScrollStack useWindowScroll smoothScroll={false} snap={false}
      stackPosition="8%" itemDistance={44} itemStackDistance={13}
      itemScale={0.045} baseScale={0.82} dimAmount={0.22} holdDistance={170}>
      {projects.map(({ name, category, cover, alt, href }, index) => (
        <ScrollStackItem key={href} itemClassName="wi-project">
          <a className="wi-project-link" href={href}>
            <img src={cover} alt={alt} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
            <span className="wi-project-caption">
              <span className="wi-label">{String(index + 1).padStart(2, '0')} / {category}</span>
              <span className="wi-project-title">{name}</span>
              <span className="wi-arrow" aria-hidden="true">↗</span>
            </span>
          </a>
        </ScrollStackItem>
      ))}
    </ScrollStack>
  );
}
