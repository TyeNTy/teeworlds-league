import React from "react";

const League = () => (
  <div className="prose prose-lg mx-auto p-5">
    <h1 className="text-3xl font-bold mb-4">gCTF League Rules</h1>
    <p>
      Welcome to the gCTF League Rules. Each clan is responsible for ensuring
      that all members have read and understood the rules. If you have any
      questions, please contact the League management and moderators.
      Disregarding these rules can lead to exclusion from the League! By
      participating in the tournament you automatically agree to these rules!
      Rules that do not directly affect you may also be important to you.
    </p>

    <h2 className="text-2xl font-bold mt-6 mb-2">
      <i>
        <b>§1 General League Info</b>
      </i>
    </h2>
    <p>
      <i>
        <b>§1.1</b>
      </i>{" "}
      The Pro League consists of 10 clans. If there are more than 10 clans,
      additional leagues will be added. The same rules apply to all leagues.
    </p>
    <p>
      <i>
        <b>§1.2</b>
      </i>{" "}
      Each clan plays a first leg and a second leg against each of the clans.
      One of the games is 2 vs 2, the other 3 vs 3.
    </p>
    <p>
      <i>
        <b>§1.3</b>
      </i>{" "}
      A match consists of a minimum of 2 rounds and a maximum of 3 rounds.
    </p>

    <p className="text-2xl font-bold mt-6 mb-2">Example</p>
    <p>
      Two clans : Clan A & Clan B<br />
      <br />
      <i>First round:</i> <b>2on2</b>
      <br />
      after 2 matches the score is 1:1 -{">"} there is a deciding 3rd match
      <br />
      Clan A wins with 3 games 2:1
    </p>
    <br />
    <p>
      <i>Second round</i>: <b>3on3</b>
      <br />
      Clan A wins with 2 games 2:0
    </p>
    <br />
    <p>
      <i>Final score:</i>
      <br />
      Clan A wins 4 points because of 4 games won, Clan B 1 point because of 1
      game won
      <br />
      The difference of clan A is +3, the difference of clan B is -3
    </p>
    <br />
    <h2 className="text-2xl font-bold mt-6 mb-2">
      <i>
        <b>§2 Clans</b>
      </i>
    </h2>
    <p>
      <i>
        <b>§2.1</b>
      </i>{" "}
      A clan must register a minimum of 4 and a maximum of 8 players.
    </p>
    <p>
      <i>
        <b>§2.2</b>
      </i>{" "}
      Each clan must have a "leader" who registers the clan and represents it in
      the gCTF Council. This does not necessarily have to be the real leader of
      the clan!
    </p>
    <p>
      <i>
        <b>§2.3</b>
      </i>{" "}
      To register for the gCTF League, the clan does not have to fulfil any
      preconditions.
    </p>
    <p>
      <i>
        <b>§2.4</b>
      </i>{" "}
      A clan can only be registered up to the specified registration deadline.
      All subsequent entries and changes can no longer be considered.
    </p>
    <p>
      <i>
        <b>§2.5</b>
      </i>{" "}
      Changes to clan members are only possible between two seasons or during
      the transfer period.
    </p>
    <p>
      <i>
        <b>§2.6</b>
      </i>{" "}
      Every player is obliged to use his registration name and the correct clan
      tag in League games.
    </p>
    <p>
      <i>
        <b>§2.7</b>
      </i>{" "}
      Every clan member must be on the Ƥ.I.Ƈ. Community. (
      <a href="https://pic.zcat.ch/" className="text-blue-500 underline">
        https://pic.zcat.ch/
      </a>
      )
    </p>

    <h2 className="text-2xl font-bold mt-6 mb-2">
      <i>
        <b>§3 Game rules</b>
      </i>
    </h2>
    <p>
      <i>
        <b>§3.1</b>
      </i>{" "}
      The games are spread over the week (except Friday) and start between 6 and
      8 pm.
    </p>
    <p>
      <i>
        <b>§3.2</b>
      </i>{" "}
      The postponement of games is possible and must be requested in the
      Council. Postponement is only possible if both clans and the mod team
      agree to the new date. The clans have no right to demand that the mod team
      agrees to the new date. (This only applies to organisational matters. If
      it is possible, there will be no problem)
    </p>
    <p>
      <i>
        <b>§3.3</b>
      </i>{" "}
      Games in 2 vs 2 mode will be played with 15 min and games in 3 vs 3 mode
      with 20 min time limit.
    </p>
    <p>
      <i>
        <b>§3.4</b>
      </i>{" "}
      The first named clan may choose the first map. The other clan has the
      opportunity to swap players after the map vote and may then choose the
      side. In the second round it is the other way round. If there is a third
      round then the side is decided by the random swap vote.
    </p>
    <p>
      <i>
        <b>§3.5</b>
      </i>{" "}
      Each clan may take a 5-minute break per round. Attention: Make sure that
      you set the pause bind in the DDNet client to a key that you do not use by
      mistake! Otherwise this will automatically count as your break. If a clan
      takes two breaks, it loses the round with 10:0!
    </p>
    <p>
      <i>
        <b>§3.6</b>
      </i>{" "}
      A clan may replace its players between rounds and during the break of its
      own team and the opposing team.
    </p>
    <p>
      <i>
        <b>§3.7</b>
      </i>{" "}
      After each round there is a break of maximum 5 minutes, after which the
      game must be continued.
    </p>
    <p>
      <i>
        <b>§3.8</b>
      </i>{" "}
      If a clan does not appear after 5 minutes of the specified time, it
      automatically loses 2 rounds with 10:0.
    </p>
    <p>
      <i>
        <b>§3.9</b>
      </i>{" "}
      If both clans do not appear after 5 minutes, no clan receives points for
      this match day.
    </p>
    <p>
      <i>
        <b>§3.10</b>
      </i>{" "}
      A clan is considered a no-show if less than 1 clan member is present.
    </p>
    <p>
      <i>
        <b>§3.11</b>
      </i>{" "}
      A clan that has not participated in more than 6 games at the end of a
      season will be banned for the next season.
    </p>

    <h2 className="text-2xl font-bold mt-6 mb-2">
      <i>
        <b>§4 Maps</b>
      </i>
    </h2>
    <p>
      <i>
        <b>§4.1</b>
      </i>{" "}
      Each clan selects one map per game from the mappool. (§4.5)
    </p>
    <p>
      <i>
        <b>§4.2</b>
      </i>{" "}
      The same map can be chosen twice.
    </p>
    <p>
      <i>
        <b>§4.3</b>
      </i>{" "}
      If there is a third round, ctf5 will always be played.
    </p>
    <p>
      <i>
        <b>§4.4</b>
      </i>{" "}
      -
    </p>
    <p>
      <i>
        <b>§4.5</b>
      </i>{" "}
      Mappool:
    </p>
    <p>
      <i>
        <b>§4.5.1</b>
      </i>{" "}
      2 vs 2:
    </p>
    <ul className="pl-6">
      <li>ctf3</li>
      <li>ctf4_old</li>
      <li>ctf5</li>
      <li>ctf_duskwood</li>
      <li>ctf_tantum</li>
      <li>ctf_mine</li>
      <li>ctf_planet</li>
      <li>ctf_ambiance</li>
    </ul>
    <p>
      <i>
        <b>§4.5.2</b>
      </i>{" "}
      3 vs 3:
    </p>
    <ul className="pl-6">
      <li>ctf2</li>
      <li>ctf5</li>
      <li>ctf_duskwood</li>
      <li>ctf_mars</li>
      <li>ctf_moon</li>
    </ul>

    <h2 className="text-2xl font-bold mt-6 mb-2">
      <i>
        <b>§5 Points/Statistics</b>
      </i>
    </h2>
    <p>
      <i>
        <b>§5.1</b>
      </i>{" "}
      A clan receives one point for winning a round.
    </p>
    <p>
      <i>
        <b>§5.2</b>
      </i>{" "}
      In the event that two clans have exactly the same number of points, the
      difference between the victories and defeats will be counted. If this also
      leads to a tie, the clan that has collected more game points wins.
    </p>
    <p>
      <i>
        <b>§5.4</b>
      </i>{" "}
      If a player is transferred to another clan during the transfer period, his
      statistics will be transferred to the new clan.
    </p>
    <p>
      <i>
        <b>2nd League</b>
      </i>{" "}
      At the end of a season, the 9th and 10th place from the Pro League are
      relegated to the 2nd League and the 1st and 2nd place from the 2nd League
      are promoted to the Pro League. The 7th place from the Pro League has to
      play against the 3rd place from the 2nd League. The winner will play in
      the Pro League in the next season. The same rules apply as during the
      season.
    </p>

    <h2 className="text-2xl font-bold mt-6 mb-2">
      <i>
        <b>§6 Prize Pool</b>
      </i>
    </h2>
    <p>
      <i>
        <b>§6.1</b>
      </i>{" "}
      Prize money is handed over to the clan leader.
    </p>
    <p>
      <i>
        <b>§6.2</b>
      </i>{" "}
      The prize pool is 300€.
    </p>
    <p>
      <i>
        <b>§6.3</b>
      </i>{" "}
      The prize pool is divided into 2 categories. 200€ will be divided between
      1st to 3rd place, 100€ will be divided by all points of all clans at the
      end of the season and then divided among all clans.
    </p>
    <p>
      <i>
        <b>§6.4</b>
      </i>{" "}
      1st - 10th place: Distribution of the 100€ to all clans according to their
      victories
    </p>
    <p>1st place: 120€</p>
    <p>2nd place: 50€</p>
    <p>3rd place: 30€</p>

    <h2 className="text-2xl font-bold mt-6 mb-2">
      <i>
        <b>§7 Council Rules</b>
      </i>
    </h2>
    <p>
      <i>
        <b>§7.1</b>
      </i>{" "}
      The Council consists of all clan leaders and the League Moderator Team.
    </p>
    <p>
      <i>
        <b>§7.2</b>
      </i>{" "}
      It serves to solve problems as quickly and easily as possible. For
      example, rule changes, cheat assumptions and much more can be requested
      here.
    </p>
    <p>
      <i>
        <b>§7.3</b>
      </i>
    </p>
    <p>
      <i>
        <b>§7.4</b>
      </i>{" "}
      The Council Chat is open to the public.
    </p>
    <p>
      <i>
        <b>§7.5</b>
      </i>{" "}
      In the event of a rule change, all clan leaders have the right to cast
      their vote in a poll.
    </p>
    <p>
      <i>
        <b>§7.6</b>
      </i>{" "}
      In order to change a rule, at least 70% must be in favour.
    </p>
    <p>
      <i>
        <b>§7.7</b>
      </i>{" "}
      The League leadership has the option of cancelling a vote. In this case, a
      justification is required, but this is no longer open to debate.
    </p>

    <h2 className="text-2xl font-bold mt-6 mb-2">
      <i>
        <b>§8 Moderation</b>
      </i>
    </h2>
    <p>
      <i>
        <b>§8.1</b>
      </i>{" "}
      Moderators are appointed exclusively by the League management.
    </p>
    <p>
      <i>
        <b>§8.2</b>
      </i>{" "}
      Moderators must act impartially.
    </p>
    <p>
      <i>
        <b>§8.3</b>
      </i>{" "}
      The name of the moderator must be announced before each match.
    </p>
    <p>
      <i>
        <b>§8.4</b>
      </i>{" "}
      The active moderator must be in a voice chat on the Ƥ.I.Ƈ. Community at
      all times. (Unmute. An offence of this type can only be requested at the
      time of an ongoing game. Complaints that can only be submitted after a
      match has been played will no longer be considered. The only exception to
      this rule is if the moderator is streaming).
    </p>
    <p>
      <i>
        <b>§8.5</b>
      </i>{" "}
      If both clans agree, moderators have some leeway on how to handle the
      rules. (Example: If a clan takes 2 breaks in a round and both clans agree
      that the game may continue, it is possible to override the rule).
    </p>
    <p>
      <i>
        <b>§8.6</b>
      </i>{" "}
      Moderators must post the screenshots of the result after each game.
    </p>
    <p>
      <i>
        <b>§8.7</b>
      </i>{" "}
      Moderators are not always right. In games, every participant is
      nevertheless obliged to follow the instructions of the moderators.
    </p>
    <p>
      Rule violations or problems with moderators can be reported to the Council
      up to 7 days after the game and will be reviewed by the League Moderator
      Team.
    </p>

    <h2 className="text-2xl font-bold mt-6 mb-2">
      <i>
        <b>§9 Law</b>
      </i>
    </h2>
    <p>
      <i>
        <b>§9.1</b>
      </i>{" "}
      Games can be postponed at short notice if the moderators are unavailable.
    </p>
    <p>
      <i>
        <b>§9.2</b>
      </i>{" "}
      The League Management reserves the right to cancel the season.
    </p>
    <p>
      <i>
        <b>§9.3</b>
      </i>{" "}
      All donations will be returned to the donors immediately in the event of
      cancellation.
    </p>
    <p>
      <i>
        <b>§9.4</b>
      </i>{" "}
      The League Management may change the rules of a current season without the
      approval of the Council. (Any change of this kind will be publicly
      recorded and justified in the Discord)
    </p>
    <p>
      <i>
        <b>§9.5</b>
      </i>{" "}
      There is no guarantee or claim to a following season.
    </p>

    <p>
      All rules marked with 2nd League only come into force if there is a 2nd
      League.
    </p>
  </div>
);

export default League;
