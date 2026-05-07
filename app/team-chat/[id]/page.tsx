
import React from 'react';
import Link from 'next/link';

export default function TeamChatPage({ params }: { params: { id: string } }) {
  // We can eventually load the team member based on params.id
  
  return (
    <div className="min-h-screen w-full bg-[#e4dfd8] flex items-center justify-center p-8" style={{
      backgroundImage: "url(https://lh3.googleusercontent.com/aida/ADBb0uhCilLHmLfDhPMwiCs2nL08qwA6V4xXkJYQ4KtwbpzOH62ThNmDWsEtxzYscnGYjlnkSs9KqANozl3XsH_1co8MEq1TXxitKN8M_ZLcIfMUc-DYny0LMDOLM5Tt0mMigyTZCfAzzVB91vXKYlO7L7hsdofrt6vkvAAaiwsKoPmx8H-JHJyiR5sM-gNy-r6UYF4_Z61SW9RSycIBI7sRuqVXMtbvBMHknTg4V6fzeOS9J6BZeTdDTHgVCjdnfkDJv5uefwuLfcCg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "'Inter', sans-serif"
    }}>
      
{/*  BEGIN: MainContainer  */}
<div className="bg-surface w-full max-w-[1400px] h-[85vh] rounded-[32px] shadow-2xl flex overflow-hidden relative backdrop-blur-sm bg-opacity-95 text-on-surface">
{/*  BEGIN: LeftSidebar (User Info)  */}
<aside className="w-[240px] flex flex-col justify-between p-6 pl-8 border-r border-surface-container">
<div className="space-y-4 pt-4 flex-1 flex flex-col h-full overflow-hidden">
<button className="w-fit bg-surface-container-lowest border border-outline-variant text-on-surface rounded-full py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium hover:bg-surface-container transition-colors shrink-0 shadow-sm">
<i className="fa-solid fa-arrow-left text-xs"></i>
          Back
        </button>
{/*  User Profile Area  */}
<div className="flex flex-col items-center mt-10">
<div className="relative mb-4">
<img alt="Sarah K." className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA18Oh_ZVYFNp5PaAvsqoe5WMEjDliUEZCc-rHCVp7u4MqU_tRNyBLQBH6scGpRXk8qEqurmOyES_gXZ_WDuU_IDUzELQUhJ2d_Q2PA4MW2iB-wuKYb1O3wjmMyB4ddiiU2RrBHCeZFvpVhP29Hc0GAZ1JaHg4UFcPDOvuQZW1xSuHbz7Ikf8sSX5aHJBkkdUksKnzp4Wm1ZyZMHi0acM-0bA01YDcrPzpjLEx5yUsl1fKZ34MNhKe967w2O7wAkGGdQto2wn29hA"/>
<div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#22c55e] border-2 border-surface"></div>
</div>
<h2 className="text-headline-md text-on-surface">Sarah K.</h2>
<p className="text-body-md text-on-surface-variant mt-1 text-center">Senior Content Strategist</p>
<div className="mt-3 px-3 py-1 bg-surface-container rounded-full text-label-md text-on-surface-variant flex items-center gap-2">
<i className="fa-regular fa-clock"></i> 09:42 AM (Local)
    </div>
</div>
{/*  About Section  */}
<div className="mt-8 space-y-6">
<div>
<h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">About</h3>
<p className="text-body-md text-on-surface">Focusing on product messaging and user flows for the upcoming Q3 launch campaign.</p>
</div>
<div>
<h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Contact Info</h3>
<ul className="space-y-3">
<li className="flex items-center gap-3 text-body-md text-on-surface">
<i className="fa-regular fa-envelope text-on-surface-variant w-4"></i> sarah.k@mas.ai
            </li>
<li className="flex items-center gap-3 text-body-md text-on-surface">
<i className="fa-solid fa-phone text-on-surface-variant w-4"></i> +1 (555) 019-2834
            </li>
<li className="flex items-center gap-3 text-body-md text-on-surface">
<i className="fa-brands fa-slack text-on-surface-variant w-4"></i> @sarah_k
            </li>
</ul>
</div>
</div>
</div>
</aside>
{/*  END: LeftSidebar  */}
{/*  BEGIN: MainChatArea (Team Chat)  */}
<main className="flex-1 bg-surface-container-lowest my-4 mr-4 rounded-[24px] shadow-sm flex flex-col relative overflow-hidden border border-surface-container">
{/*  Top Bar  */}
<div className="absolute top-0 w-full flex justify-between items-center px-8 py-4 bg-surface-container-lowest/90 backdrop-blur-md z-10 border-b border-surface-container">
<div className="flex items-center gap-3">
<div className="relative">
<img alt="Sarah K." className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA18Oh_ZVYFNp5PaAvsqoe5WMEjDliUEZCc-rHCVp7u4MqU_tRNyBLQBH6scGpRXk8qEqurmOyES_gXZ_WDuU_IDUzELQUhJ2d_Q2PA4MW2iB-wuKYb1O3wjmMyB4ddiiU2RrBHCeZFvpVhP29Hc0GAZ1JaHg4UFcPDOvuQZW1xSuHbz7Ikf8sSX5aHJBkkdUksKnzp4Wm1ZyZMHi0acM-0bA01YDcrPzpjLEx5yUsl1fKZ34MNhKe967w2O7wAkGGdQto2wn29hA"/>
<div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-surface-container-lowest"></div>
</div>
<div>
<h2 className="text-headline-md text-on-surface text-base">Sarah K.</h2>
<p className="text-label-sm text-on-surface-variant font-normal">Active now</p>
</div>
</div>
<div className="flex gap-4 text-on-surface-variant">
<button className="hover:text-on-surface transition-colors"><i className="fa-solid fa-phone"></i></button>
<button className="hover:text-on-surface transition-colors"><i className="fa-solid fa-video"></i></button>
<button className="hover:text-on-surface transition-colors"><i className="fa-solid fa-ellipsis-vertical"></i></button>
</div>
</div>
{/*  Chat History  */}
<div className="flex-1 overflow-y-auto px-10 pt-24 pb-32 flex flex-col gap-6">
{/*  Time separator  */}
<div className="text-center text-label-md text-on-surface-variant my-2">Today, 10:45 AM</div>
{/*  User Message 1  */}
<div className="flex flex-col items-end gap-1">
<div className="bg-primary text-on-primary text-body-md px-5 py-3 rounded-t-2xl rounded-bl-2xl rounded-br-md max-w-xl shadow-sm">
            Hey Sarah, have you checked the design files for the new campaign?
          </div>
<span className="text-[10px] text-on-surface-variant mr-2">10:45</span>
</div>
{/*  Teammate Message 1  */}
<div className="flex items-end gap-2 max-w-2xl">
<img alt="Sarah K." className="w-6 h-6 rounded-full object-cover mb-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA18Oh_ZVYFNp5PaAvsqoe5WMEjDliUEZCc-rHCVp7u4MqU_tRNyBLQBH6scGpRXk8qEqurmOyES_gXZ_WDuU_IDUzELQUhJ2d_Q2PA4MW2iB-wuKYb1O3wjmMyB4ddiiU2RrBHCeZFvpVhP29Hc0GAZ1JaHg4UFcPDOvuQZW1xSuHbz7Ikf8sSX5aHJBkkdUksKnzp4Wm1ZyZMHi0acM-0bA01YDcrPzpjLEx5yUsl1fKZ34MNhKe967w2O7wAkGGdQto2wn29hA"/>
<div className="flex flex-col items-start gap-1 flex-1">
<div className="bg-surface-container text-on-surface text-body-md px-5 py-3 rounded-t-2xl rounded-br-2xl rounded-bl-md shadow-sm border border-surface-container-high">
            Hi! Yes, I'm looking at them right now. The new layout looks great.
          </div>
<span className="text-[10px] text-on-surface-variant ml-2">10:48</span>
</div>
</div>
{/*  User Message 2  */}
<div className="flex flex-col items-end gap-1">
<div className="bg-primary text-on-primary text-body-md px-5 py-3 rounded-t-2xl rounded-bl-2xl rounded-br-md max-w-xl shadow-sm">
            Awesome. Let me know if you need any text adjustments or if the copy needs to be shorter.
          </div>
<span className="text-[10px] text-on-surface-variant mr-2">10:50</span>
</div>
{/*  Teammate Message 2  */}
<div className="flex items-end gap-2 max-w-2xl">
<img alt="Sarah K." className="w-6 h-6 rounded-full object-cover mb-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA18Oh_ZVYFNp5PaAvsqoe5WMEjDliUEZCc-rHCVp7u4MqU_tRNyBLQBH6scGpRXk8qEqurmOyES_gXZ_WDuU_IDUzELQUhJ2d_Q2PA4MW2iB-wuKYb1O3wjmMyB4ddiiU2RrBHCeZFvpVhP29Hc0GAZ1JaHg4UFcPDOvuQZW1xSuHbz7Ikf8sSX5aHJBkkdUksKnzp4Wm1ZyZMHi0acM-0bA01YDcrPzpjLEx5yUsl1fKZ34MNhKe967w2O7wAkGGdQto2wn29hA"/>
<div className="flex flex-col items-start gap-1 flex-1">
<div className="bg-surface-container text-on-surface text-body-md px-5 py-3 rounded-t-2xl rounded-br-2xl rounded-bl-md shadow-sm border border-surface-container-high">
              Will do! I'll probably need to tweak the hero copy a bit to fit the new aspect ratio. I'll ping you when I have a draft ready.
            </div>
<span className="text-[10px] text-on-surface-variant ml-2">11:02</span>
</div>
</div>
</div>
{/*  Input Area  */}
<div className="absolute bottom-6 left-0 right-0 px-10">
<div className="bg-surface-container-lowest rounded-full flex items-center px-4 py-2 shadow-md border border-surface-container">
<button className="text-on-surface-variant hover:text-on-surface p-2 transition-colors">
<i className="fa-solid fa-paperclip"></i>
</button>
<button className="text-on-surface-variant hover:text-on-surface p-2 transition-colors">
<i className="fa-regular fa-face-smile"></i>
</button>
<input className="flex-1 border-none focus:ring-0 bg-transparent text-sm text-on-surface font-body-md placeholder-on-surface-variant mx-4" placeholder="Type a message..." type="text"/>
<button className="bg-primary text-on-primary rounded-full w-8 h-8 flex items-center justify-center hover:opacity-90 transition-opacity">
<i className="fa-solid fa-paper-plane text-xs"></i>
</button>
</div>
</div>
</main>
{/*  END: MainChatArea  */}
{/*  BEGIN: RightSidebar (Team Chat List)  */}
<aside className="w-[280px] p-6 pr-8 flex flex-col gap-6 overflow-y-auto bg-surface">
{/*  Team Chat Header  */}
<div className="flex justify-between items-center pt-2">
<h3 className="text-headline-md text-on-surface text-sm flex items-center gap-2">
<i className="fa-solid fa-users text-on-surface-variant"></i> Team Chat
</h3>
<button className="text-on-surface-variant hover:text-on-surface bg-surface-container-lowest rounded-full w-6 h-6 flex items-center justify-center shadow-sm border border-surface-container">
<i className="fa-solid fa-plus text-[10px]"></i>
</button>
</div>
{/*  Search Box  */}
<div className="relative">
<i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant text-xs"></i>
<input className="w-full bg-surface-container-lowest border border-surface-container rounded-full py-2 pl-8 pr-4 text-xs font-body-md focus:outline-none focus:border-outline shadow-sm placeholder-on-surface-variant text-on-surface" placeholder="Search team..." type="text"/>
</div>
{/*  Team Members List  */}
<div className="space-y-2 mt-2">
{/*  Member 1 (Active)  */}
<div className="flex items-center gap-3 p-2 bg-surface-container rounded-xl cursor-pointer transition-colors">
<div className="relative">
<img alt="Sarah K." className="avatar-img shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA18Oh_ZVYFNp5PaAvsqoe5WMEjDliUEZCc-rHCVp7u4MqU_tRNyBLQBH6scGpRXk8qEqurmOyES_gXZ_WDuU_IDUzELQUhJ2d_Q2PA4MW2iB-wuKYb1O3wjmMyB4ddiiU2RrBHCeZFvpVhP29Hc0GAZ1JaHg4UFcPDOvuQZW1xSuHbz7Ikf8sSX5aHJBkkdUksKnzp4Wm1ZyZMHi0acM-0bA01YDcrPzpjLEx5yUsl1fKZ34MNhKe967w2O7wAkGGdQto2wn29hA"/>
<div className="status-indicator status-online"></div>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h4 className="text-label-md font-semibold text-on-surface truncate">Sarah K.</h4>
<span className="text-[9px] text-on-surface-variant">11:02</span>
</div>
<p className="text-[11px] font-body-md text-on-surface-variant truncate">I'll ping you when I have a d...</p>
</div>
</div>
{/*  Member 2  */}
<div className="flex items-center gap-3 p-2 hover:bg-surface-container-low rounded-xl cursor-pointer transition-colors">
<div className="relative">
<img alt="Alex M." className="avatar-img shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN70FYFZyEyUJw8Epzfa_tdHqi30fLeRnWBNvrE5yQUQLhPOrQvdQ1s-i9jg586ko0Qs06lse0Pt-WPx0ytq_23TYVQv3C18gvqwCWTSfGW01vTdFT4QTS617FLnePNCJDd2OKOKo6rfHZeHt5gGdlyGeaIINXQetPlo-1G0wmj3HQ_PnyY5yuINIm2qz6FV6ApJWiuuVrBpg4UeMMaxBZ78UawW1APraznTRFQDKoInxtj8wVCoI82wyXHo3rwMEuN7i-qr5xeA"/>
<div className="status-indicator status-away"></div>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h4 className="text-label-md font-semibold text-on-surface truncate">Alex M.</h4>
<span className="text-[9px] text-on-surface-variant">12m</span>
</div>
<p className="text-[11px] font-body-md text-on-surface-variant truncate">Can we review the PR?</p>
</div>
</div>
{/*  Member 3  */}
<div className="flex items-center gap-3 p-2 hover:bg-surface-container-low rounded-xl cursor-pointer transition-colors">
<div className="relative">
<img alt="David L." className="avatar-img shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8wP-119dq8BAZqeBT1FRNpl1SoLMnfy09Fz9NyK3Ih2wcInQdt6LcF-KxESnochMS5bMJtVcgZQWn3Is27DS8bfhl0ufRkHEnQlDvaKIO_fMBlxe6JuIgB84R-3O4IUKTfmDNV5d8WYUdTgFSsC6bOzikj7njqtPnklwZN5B7WI7OkOwhATnJ5JdJ-J7L3wPxhJDu4TOoX-VQq9wWGC3dFsGgvKo8ZBvtJaq55v_9TIfynA7CUuJatblorGKBwTMiVtou55WlFA"/>
<div className="status-indicator status-busy"></div>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h4 className="text-label-md font-semibold text-on-surface truncate">David L.</h4>
<span className="text-[9px] text-on-surface-variant">1h</span>
</div>
<p className="text-[11px] font-body-md text-on-surface-variant truncate">In a meeting, back later.</p>
</div>
</div>
{/*  Member 4  */}
<div className="flex items-center gap-3 p-2 hover:bg-surface-container-low rounded-xl cursor-pointer transition-colors">
<div className="relative">
<img alt="Emily R." className="avatar-img shadow-sm opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCspKC7yE_vCgt7rgJ2QQyq9H0taa8I4sEyRUSdPejqPogCAiv0-QH_eDGfsba8Fr1-ROWF0xPFE-8yC_Mxf3SU7eGqAolsGqJ-Dq6B84R_FI5ai6_GLTAg1p-lYBdrN7MD6G_Rb5Wt6e8EZgvdHr7ohZB623zXDze9PSbb9xg1H-R0Vt5iE5PJutekNFytpTIPOce0J8Z0FsU8tgLqsWgxqOcotDZ-kcMOs4KNbRmaK3jSKvRr3N870nu0OoevvSSaQ1whgAto7w"/>
<div className="status-indicator bg-outline-variant"></div>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h4 className="text-label-md font-semibold text-on-surface truncate">Emily R.</h4>
<span className="text-[9px] text-on-surface-variant">Yesterday</span>
</div>
<p className="text-[11px] font-body-md text-on-surface-variant truncate">Thanks for the update!</p>
</div>
</div>
</div>
</aside>
{/*  END: RightSidebar  */}
</div>
{/*  END: MainContainer  */}

    </div>
  );
}
