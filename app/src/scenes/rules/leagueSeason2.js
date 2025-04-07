import React from "react";

const League = () => (
  <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-bold text-red-800">Important Notice</h3>
          <div className="mt-2 text-red-700">
            <p>
              You must use the official League Client to participate in League
              Games. Download it here:{" "}
              <a
                href="https://downloads.zcat.ch/league/"
                className="font-bold underline hover:text-red-900"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://downloads.zcat.ch/league/
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        gCTF League Rules
      </h1>
      <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
      <p className="text-lg text-gray-600 leading-relaxed">
        <strong className="text-blue-600">
          Welcome to the gCTF League Rules.
        </strong>
        <br />
        Each clan is responsible for ensuring that all members have read and
        understood the rules. If you have any questions, please contact the
        League Admins and Moderators. Disregarding these rules can lead to
        exclusion from the League! By participating in the tournament you
        automatically agree to these rules! Even rules that do not affect you
        directly may be important to you!
      </p>
    </div>

    <div className="space-y-8">
      <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-blue-600 mr-2">§1</span> Clans
        </h2>
        <div className="space-y-3">
          {[
            "A clan must register a minimum of 4 and a maximum of 8 players.",
            'Each clan must have a "Leader" who registers the clan and represents it in the gCTF Council.',
            "Changes of clan members are only possible between two seasons or in the transfer period.",
            "Every player is obliged to use his login name and the correct clan tag in League games.",
            "Every clan member must be on the League Discord.",
          ].map((rule, index) => (
            <p key={index} className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">
                §1.{index + 1}
              </span>
              <span className="text-gray-700">{rule}</span>
            </p>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-blue-600 mr-2">§2</span> Game Rules
        </h2>
        <div className="space-y-3">
          {[
            "Each clan plays a first leg and a second leg against each of the clans. One of the games is 2 vs 2, the other 3 vs 3.",
            "A game consists of a minimum of 2 rounds and a maximum of 3 rounds.",
            "The games are spread over the week (except Friday) and start between 6 and 9 pm.",
            "The postponement of games is possible and must be requested in the Council. Postponement is only possible if both clans and the mod team agree to the new date. The clans have no right to demand that the mod team agrees to the new date. (This only applies to organizational matters. If it is possible, there will be no problem)",
            "Games in 2 vs 2 mode will be played with 15 min and games in 3 vs 3 mode with 20 min time limit.",
            "The first named clan may choose the first map. The other clan has the opportunity to swap players after the map vote and may then choose the side. In the second round it is the other way around. If there is a third round then the side is decided by the random swap vote.",
            "Each clan may take a 5-minute break per round. Attention: Make sure that you set the pause bind in the DDNet client to a key that you do not use by mistake! Otherwise this will automatically count as your break. If a clan takes two breaks, it loses the round with 10:0!",
            "A clan may replace its players between the rounds and during the break of its own team and the opposing team.",
            "After each round there is a break of maximum 5 minutes, after which the game must be continued.",
            "If a clan does not show up after 5 minutes of the specified time, it automatically loses 2 rounds with 10:0.",
            "If both clans do not show up after 5 minutes, no clan will receive points for this match day.",
            "A clan is considered a no-show if less than 1 clan member is present.",
            "A clan that has not participated in more than 6 games at the end of a season will be banned for the next season.",
            "Only an official League Client may be used in League Games. (Download here : https://downloads.zcat.ch/league/)",
          ].map((rule, index) => (
            <p key={index} className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">
                §2.{index + 1}
              </span>
              <span className="text-gray-700">{rule}</span>
            </p>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-blue-600 mr-2">§3</span> Maps
        </h2>
        <div className="space-y-3">
          <p className="flex items-start">
            <span className="text-blue-600 font-bold mr-2">§3.1</span>
            <span className="text-gray-700">
              Each clan selects one map per game from the mappool. (§3.4)
            </span>
          </p>
          <p className="flex items-start">
            <span className="text-blue-600 font-bold mr-2">§3.2</span>
            <span className="text-gray-700">
              Each map can only be played once per match day.
            </span>
          </p>
          <p className="flex items-start">
            <span className="text-blue-600 font-bold mr-2">§3.3</span>
            <span className="text-gray-700">
              If there is a third round, a random map from the respective map
              pool will be voted.
            </span>
          </p>
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              §3.4 Mappool:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-lg font-semibold text-blue-600 mb-3">
                  §3.4.1 2 vs 2:
                </h4>
                <ul className="space-y-2">
                  {[
                    "ctf3",
                    "ctf4_old",
                    "ctf5",
                    "ctf_duskwood",
                    "ctf_tantum",
                    "ctf_mine",
                    "ctf_planet",
                    "ctf_ambiance",
                  ].map((map, index) => (
                    <li key={index} className="text-gray-700">
                      {map}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-lg font-semibold text-blue-600 mb-3">
                  §3.4.2 3 vs 3:
                </h4>
                <ul className="space-y-2">
                  {[
                    "ctf2",
                    "ctf5",
                    "ctf_duskwood",
                    "ctf_cryochasm",
                    "ctf_mars",
                    "ctf_moon",
                  ].map((map, index) => (
                    <li key={index} className="text-gray-700">
                      {map}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-blue-600 mr-2">§4</span> Points/Statistics
        </h2>
        <div className="space-y-3">
          {[
            "A clan receives one point for winning a round.",
            "In the event that two clans have exactly the same number of points, the difference between the victories and defeats will be taken into account. If this also leads to a tie, the clan that has collected more game points wins.",
            "If a player is transferred to another clan during the transfer period, his statistics will be transferred to the new clan.",
          ].map((rule, index) => (
            <p key={index} className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">
                §4.{index + 1}
              </span>
              <span className="text-gray-700">{rule}</span>
            </p>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-blue-600 mr-2">§5</span> Prize Pool
        </h2>
        <div className="space-y-3">
          {[
            "Prize money is handed over to the clan leader.",
            "The prize pool can be increased by donations.",
            "The prize pool is divided into 2 categories. 2/3 will be divided between 1st to 3rd place, 1/3 will be divided by all points of all clans at the end of the season and then divided among all clans.",
          ].map((rule, index) => (
            <p key={index} className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">
                §5.{index + 1}
              </span>
              <span className="text-gray-700">{rule}</span>
            </p>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-blue-600 mr-2">§6</span> Council Rules
        </h2>
        <div className="space-y-3">
          {[
            "The Council consists of all clan leaders and the League Admins.",
            "It serves to solve problems as quickly and easily as possible. For example, rule changes, cheat suggestions and much more can be requested here.",
            "The Council Chat is open to the public.",
            "In the event of a rule change, all Clanleaders have the right to cast their vote in a poll.",
            "To change a rule, at least 70% of the clan leaders must agree.",
            "The League leadership has the possibility to cancel a vote.",
          ].map((rule, index) => (
            <p key={index} className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">
                §6.{index + 1}
              </span>
              <span className="text-gray-700">{rule}</span>
            </p>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-blue-600 mr-2">§7</span> Moderation
        </h2>
        <div className="space-y-3">
          {[
            "Games can be postponed at short notice if the moderators are unavailable.",
            "The active moderator must be in the League Games voice chat at all times. (Unmute. A rule violation of this type can only be requested at the time of an ongoing game. Complaints that can only be submitted after a match has been played will no longer be considered. The only exception to this rule is if the moderator is streaming).",
            "If both clans agree, moderators have some leeway on how to handle the rules. (Example: If a clan takes 2 breaks in a round and both clans agree that the game may continue, it is possible to override the rule).",
            "Rule violations or problems with moderators can be reported to the Council up to 7 days after the game and will be reviewed by the League Moderator Team.",
            "The League Management can change the rules of a current season without the approval of the Council. (Any change of this kind will be publicly recorded and justified in the Discord)",
          ].map((rule, index) => (
            <p key={index} className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">
                §7.{index + 1}
              </span>
              <span className="text-gray-700">{rule}</span>
            </p>
          ))}
        </div>
      </section>
    </div>
  </div>
);

export default League;
