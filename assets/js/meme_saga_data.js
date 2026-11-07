// Truyền Kỳ: cốt truyện dài theo từng đấu sĩ. Mỗi hồi cần đạt cấp nhân vật nhất định.
// Dòng thoại: 'h:' = đấu sĩ của bạn, 'e:' = đối thủ, 'n:' = dẫn truyện.
// Hồi: [tên, đối thủ, biểu tượng, bộ bài đối thủ, [thoại mở đầu], thoại thắng]
(function () {
  'use strict';

  const LEVELS = [1, 4, 8, 14, 22, 32];
  const REWARDS = [
    { xu: 300, hxp: 120 }, { xu: 400, hxp: 150, t: { p1: 1 } }, { xu: 500, hxp: 180, dust: 40 },
    { xu: 650, hxp: 220, t: { p2: 1 } }, { xu: 800, hxp: 280, dust: 80 }, { xu: 1200, hxp: 400, t: { p3: 1 } }
  ];

  const SAGA = {
    0: {
      title: 'Vua Trò Chơi · Lời Nguyền Ngàn Năm',
      intro: 'Chiếc Chìa Khóa Ngàn Năm mở ra, và ký ức của vị pháp lão cổ đại thức tỉnh.',
      acts: [
        ['Giải Đấu Xóm Làng', 'Joey Wheeler', '🪙', 'Joey · Kinh điển', ['n:Một tấm áp phích dán khắp xóm: Giải Đấu Hỗn Hợp, người thắng nhận Chìa Khóa Ngàn Năm.', 'e:Này, cậu bé xếp hình! Nghe nói cậu hay may mắn lắm. Đấu với tớ một ván thử xem!', 'h:Được thôi. Bài của tôi không chỉ nhờ may mắn đâu.'], 'e:Haha… thua rồi! Nhưng ván sau tớ sẽ không nhường đâu!'],
        ['Cái Bóng Dưới Đáy Giếng', 'Pegasus', '◉', 'Pegasus · Kinh điển', ['n:Đêm xuống, tòa lâu đài cổ sáng đèn. Có kẻ đang mời bạn vào.', 'e:Chào mừng, Vua Trò Chơi. Ta đã chờ ngày bài của cậu đứng trước bài của ta.', 'h:Những lá Toon ấy… chúng không chỉ là hoạt hình, phải không?'], 'e:Thú vị… Ta sẽ nhớ nước đi vừa rồi.'],
        ['Pháp Sư Và Rồng Trắng', 'Seto Kaiba', '🐉', 'Kaiba · Phản công', ['n:Sảnh đấu Kaiba Corp, hàng trăm màn hình đồng loạt bật sáng.', 'e:Ta đã mua mọi tấm Mắt Xanh trên đời. Và cậu vẫn dám đứng đây?', 'h:Bài không đo bằng tiền. Hãy xem trái tim của bộ bài này.'], 'e:Hừ… Lần sau ta sẽ đến với bộ bài hoàn hảo hơn.'],
        ['Năm Mảnh Cấm Kỵ', 'Kẻ Phong Ấn', '🀫', 'Yugi · Exodia', ['n:Trong hầm đá, một giọng nói lạnh lẽo vang lên.', 'e:Năm mảnh Exodia đang gần đủ. Ngươi sẽ không kịp rút bài cuối.', 'h:Vậy ta sẽ không để ngươi rút đủ năm lá!'], 'n:Mảnh cuối cùng chưa kịp xuất hiện. Hầm đá lặng im.'],
        ['Ba Vị Thần Cổ Đại', 'Thầy Tế Thần Bí', '⚡', 'Yugi · Thần Osiris', ['n:Ba tấm bia thần chói sáng trên cao nguyên.', 'e:Ngươi mang linh hồn của vị vua cổ. Hãy chứng minh nó với Osiris!', 'h:Tôi không đấu vì ngai vàng. Tôi đấu vì bạn bè của mình.'], 'e:Một trái tim như vậy… Osiris đã chọn đúng.'],
        ['Trận Cuối: Pháp Sư Tối Thượng', 'Bóng Tối Ngàn Năm', '🔮', 'Yugi · Ma Thuật Tối Thượng', ['n:Mọi ánh sáng tắt hẳn. Chỉ còn bàn đấu và một bóng đen khổng lồ.', 'e:Ta là mọi nỗi sợ ngươi từng chôn giấu. Ngươi không thể thắng chính mình.', 'h:Tôi không cần thắng chính mình. Tôi chỉ cần tin vào lá bài kế tiếp!'], 'n:Bóng tối tan thành bụi sáng. Chìa Khóa Ngàn Năm lặng lẽ khép lại. Câu chuyện của Vua Trò Chơi khép lại — nhưng những ván đấu mới đang chờ.']
      ]
    },
    1: {
      title: 'Hoàng Đế Mắt Xanh · Đế Chế Kaiba',
      intro: 'Với Kaiba, thua là điều không tồn tại. Cho đến khi một đối thủ làm hắn nghi ngờ chính mình.',
      acts: [
        ['Buổi Họp Cổ Đông', 'Gã Cổ Đông Cứng Đầu', '💼', 'Kaiba · Kinh điển', ['n:Phòng họp Kaiba Corp, các cổ đông cười nhạt khi nghe kế hoạch giải đấu.', 'e:Một trò chơi bài mà cũng đòi đầu tư hàng tỷ? Thắng tôi một ván đã.', 'h:Được. Ta không bàn luận với kẻ chưa từng thua.'], 'e:Được rồi… ngài thắng. Kế hoạch sẽ được duyệt.'],
        ['Công Viên Rồng Mắt Xanh', 'Joey Wheeler', '🪙', 'Joey · Phản công', ['n:Đấu trường mới của Kaiba Land mở cửa, và một kẻ không mời đã xông vào.', 'e:Nghe nói ông chủ giàu nhất vùng! Thử xem rồng của tớ có hơn rồng của cậu không!', 'h:Đồ ngốc. Ngươi chưa từng thấy ba con Mắt Xanh cùng gầm.'], 'e:Ối… cậu đúng là đáng sợ thật.'],
        ['Tử Thù Tại Lâu Đài', 'Pegasus', '◉', 'Pegasus · Phản công', ['n:Em trai ta bị giam trong một thẻ bài. Kẻ giữ nó đang cười.', 'e:Muốn em trai ư? Thắng ta, rồi ta sẽ cân nhắc.', 'h:Ta sẽ lấy lại nó. Cho dù phải đốt cả lâu đài này.'], 'e:Ta chịu thua… hôm nay thôi.'],
        ['Cú Sốc Obelisk', 'Pháp Sư Hiến Tế', '🗿', 'Kaiba · Obelisk', ['n:Một thần thú ngủ yên dưới tòa nhà trung tâm. Có kẻ muốn đánh thức nó.', 'e:Kẻ yếu hiến tế kẻ yếu. Còn ngươi hiến tế cả niềm kiêu hãnh.', 'h:Niềm kiêu hãnh của ta không bán. Nhưng quái của ngươi thì sẽ thành tế phẩm.'], 'e:Obelisk… sao lại chọn hắn?'],
        ['Rồng Giữa Bão Tố', 'Atem Bí Ẩn', '◈', 'Yugi · Thần Osiris', ['n:Giải đấu thế giới đến hồi cuối. Đối thủ khoác áo choàng đỏ.', 'e:Ta nghe nói ngươi có mọi quân bài mạnh nhất. Còn trái tim thì sao?', 'h:Ta không cần lời lẽ. Ván đấu sẽ nói thay.'], 'e:Ngươi mạnh hơn lần trước. Rất đáng nể.'],
        ['Trận Cuối: Đỉnh Cao Mắt Xanh', 'Kẻ Thách Thức Vô Danh', '👑', 'Kaiba · Đỉnh Cao Mắt Xanh', ['n:Mọi tấm màn đen kéo xuống. Chỉ còn sân đấu và một chiếc ghế trống.', 'e:Đỉnh cao ngươi dựng lên sẽ do ta phá xuống.', 'h:Thử xem. Rồng Trắng Mắt Xanh chưa từng bay thấp.'], 'n:Rồng Trắng gầm vang trời. Kaiba cười lần đầu tiên sau nhiều năm: không phải vì chiến thắng, mà vì có kẻ xứng đáng đấu cùng.']
      ]
    },
    2: {
      title: 'Cược Cả Đời · Hành Trình Của Joey',
      intro: 'Từ đứa trẻ bị khinh thường, Joey quyết tâm trở thành nhà vô địch bằng chính niềm may mắn của mình.',
      acts: [
        ['Ván Đầu Tiên', 'Tên Côn Đồ Đầu Đường', '🥊', 'Joey · Kinh điển', ['n:Con hẻm sau trường, một gã to xác chặn đường.', 'e:Đưa thẻ bài đây, nhóc.', 'h:Muốn lấy à? Thắng tớ một ván trước đã!'], 'e:Ái chà… nhóc này cứng đấy.'],
        ['Cánh Cửa Giải Đấu', 'Mai Valentine', '🪶', 'Mai · Kinh điển', ['n:Vòng loại giải đấu. Một cô gái xinh đẹp mỉm cười ở bàn đối diện.', 'e:Cậu bé may mắn nhỉ? Để xem may mắn có đủ để thắng Harpie không.', 'h:Tớ không chỉ dựa vào may mắn! Tớ có cả một đội bạn ủng hộ!'], 'e:Hừ… ván sau chị sẽ nghiêm túc hơn.'],
        ['Rồng Đen Thức Tỉnh', 'Zane Truesdale', '⚡', 'Zane · Kinh điển', ['n:Kẻ mạnh nhất học viện hạ mình thách đấu. Không ai dám từ chối.', 'e:Cậu có một con rồng nhỏ. Hãy xem nó có đủ lửa không.', 'h:Nhỏ thì sao? Rồng Đen Mắt Đỏ của tớ sẽ nuốt chửng bộ máy của cậu!'], 'e:Con rồng đó… không hề nhỏ.'],
        ['Thời Gian Không Chờ Ai', 'Phù Thủy Thời Gian', '⏳', 'Joey · Thời gian', ['n:Đồng hồ khổng lồ quay ngược, mọi quân bài như già đi trước mắt.', 'e:Ngươi chỉ có ba lượt. Sau đó thời gian sẽ lấy hết.', 'h:Vậy tớ chỉ cần thắng trong hai lượt thôi!'], 'e:Hai lượt… thật sự đã đủ?'],
        ['Cược Tất Cả', 'Kaiba Đen', '🐉', 'Kaiba · Phản công', ['n:Mọi người nín thở. Kẻ giàu nhất xóm trực tiếp xuống sân.', 'e:Ta cược cả công ty của ta. Còn ngươi cược gì?', 'h:Tớ cược cả niềm tin vào bộ bài này!'], 'e:Ngươi… thực sự là một tay cược liều mạng.'],
        ['Trận Cuối: Rồng Đen Bất Diệt', 'Nhà Vô Địch Cũ', '🏆', 'Joey · Rồng Đen Bất Diệt', ['n:Khán đài rền vang tiếng gọi tên Joey.', 'e:Ngôi vô địch không dành cho kẻ may mắn. Hãy chứng minh!', 'h:May mắn à? Tớ đã tập luyện hơn ai hết. Đây là bộ bài của tớ!'], 'n:Cúp vô địch lấp lánh trong tay Joey. Cậu giơ cao, hét lên: “Cảm ơn mọi người đã tin tớ!”']
      ]
    },
    3: {
      title: 'Vương Quốc Hoạt Hình · Bí Mật Của Pegasus',
      intro: 'Trò chơi này sinh ra từ nỗi nhớ một người đã khuất. Pegasus không bao giờ ngừng tìm lại người ấy.',
      acts: [
        ['Buổi Triển Lãm', 'Nhà Phê Bình Khó Tính', '🎩', 'Pegasus · Kinh điển', ['n:Triển lãm Toon World, các nhà phê bình xì xào.', 'e:Hoạt hình mà cũng đòi sánh với bài chiến? Cho tôi xem thử.', 'h:Ồ, cứ xem. Bài của ta biết kể chuyện.'], 'e:Tôi… thật sự bị cuốn vào rồi.'],
        ['Lời Mời Của Nhà Vua', 'Yugi Muto', '◈', 'Yugi · Phản công', ['n:Một cậu bé nhỏ nhắn xuất hiện trước cổng lâu đài.', 'e:Tôi nhận lời mời của ngài. Nhưng tôi sẽ không hiến linh hồn bạn bè.', 'h:Vậy hãy đánh bằng bài. Toon sẽ khiến cậu cười, rồi nhìn xem.'], 'e:Ngài… không giống những gì tôi nghĩ.'],
        ['Hầm Rượu Bí Mật', 'Mai Valentine', '🪶', 'Mai · Phản công', ['n:Trong hầm rượu cổ, một người đẹp đang chờ.', 'e:Ta nghe nói ngài có bí mật. Thắng ta, ta sẽ giữ im lặng.', 'h:Phụ nữ thông minh luôn khiến ta thích thú.'], 'e:Ngài thắng rồi. Nhưng bí mật vẫn là của ngài.'],
        ['Thế Giới Kỳ Ảo', 'Jaden Yuki', '🔥', 'Jaden · Kinh điển', ['n:Cậu học sinh vui vẻ đẩy cửa bước vào như vào nhà mình.', 'e:Chú ơi, bài chú ngộ nghĩnh quá! Đấu với cháu nhé!', 'h:Ha ha, cậu bé vui tính. Nào, hãy chơi cho đã!'], 'e:Vui quá! Thua mà vẫn vui!'],
        ['Nỗi Nhớ Trong Bài', 'Bóng Người Cũ', '🌙', 'Pegasus · Phản công', ['n:Bức ảnh trên bàn bỗng nhòe đi, một bóng người đứng trước mặt.', 'e:Ngài vẫn giữ lời hứa chứ?', 'h:Mỗi ván bài ta đánh… đều là vì em.'], 'n:Bóng người mỉm cười rồi tan vào ánh sáng.'],
        ['Trận Cuối: Vương Quốc Hoạt Hình', 'Chính Ta Trong Gương', '🪞', 'Pegasus · Vương Quốc Hoạt Hình', ['n:Cả tòa lâu đài biến thành màn hình khổng lồ. Trước mặt ngài là một người giống hệt.', 'e:Ngươi dựng cả một vương quốc để trốn nỗi đau.', 'h:Phải. Và bây giờ ta sẽ dùng vương quốc ấy để đối diện nó.'], 'n:Tấm gương vỡ. Pegasus mỉm cười, cuối cùng không còn là kẻ cô đơn.']
      ]
    },
    4: {
      title: 'Anh Hùng Tối Thượng · Học Viện Duel',
      intro: 'Jaden chỉ cần một điều: một ván đấu vui. Nhưng bóng tối của học viện không đơn giản như vậy.',
      acts: [
        ['Kỳ Thi Nhập Học', 'Giám Khảo Chronos', '🐱', 'Zane · Kinh điển', ['n:Sân thi đấu Học Viện, hàng trăm tân sinh đang hồi hộp.', 'e:Thí sinh Yuki! Trò sẽ đấu với giám khảo!', 'h:Tuyệt quá! Cuối cùng cũng có người chịu chơi với mình!'], 'e:Đạt… trò đạt, dù chọn bài hơi kỳ lạ.'],
        ['Bạn Cùng Phòng', 'Syrus Truesdale', '🌀', 'Jaden · Kinh điển', ['n:Một cậu bạn nhút nhát ôm bộ bài run run.', 'e:Jaden… cậu có thể đấu với mình không? Mình muốn mạnh hơn.', 'h:Chắc chắn rồi! Cứ chơi hết mình đi!'], 'e:Mình thua… nhưng vui quá!'],
        ['Hồ Chứa Linh Hồn', 'Mai Valentine', '🪶', 'Mai · Kinh điển', ['n:Trên bờ hồ yên ắng, một phụ nữ xinh đẹp đang chờ.', 'e:Cậu bé HERO, ta muốn thử sức Harpie của mình!', 'h:Hay lắm! Đấu nào, Mai!'], 'e:Chà… cậu quả là ngôi sao của thế hệ mới.'],
        ['Cổng Ngầm', 'Zane Truesdale', '⚡', 'Zane · Phản công', ['n:Cơn gió lạnh thổi qua sân đấu. Người đàn anh lẳng lặng bước vào.', 'e:Jaden, em có đủ sức đánh bại một Cyber không?', 'h:Em vui lắm! Đây mới là ván em mong chờ!'], 'e:Em đã thực sự trưởng thành.'],
        ['Neo-Spacian Giáng Thế', 'Bóng Tối Dưới Hầm', '🌈', 'Jaden · Neo-Spacian', ['n:Dưới hầm tối, một giọng nói thì thầm, “Bóng tối đang tới.”', 'e:Ngươi sẽ chỉ là một đứa trẻ cô đơn khi ta nuốt hết ánh sáng.', 'h:Nhưng tớ có Neos, và bao nhiêu người bạn tin tưởng tớ!'], 'e:Ánh sáng… chói quá…'],
        ['Trận Cuối: Anh Hùng Tối Thượng', 'Chúa Tể Bóng Tối', '🛡️', 'Jaden · Anh Hùng Tối Thượng', ['n:Bầu trời rạn nứt. Ở đó, kẻ cuối cùng đứng chờ.', 'e:Mọi ánh sáng đều tắt. Ngươi chỉ là một đốm lửa nhỏ.', 'h:Đốm lửa nhỏ cũng đủ đốt cả bóng tối. Nào, HERO của tớ, xuất trận!'], 'n:Bóng tối tan biến. Jaden vươn vai, cười: “Ván đấu hay thật, lần sau chơi nữa nhé!”']
      ]
    },
    5: {
      title: 'Hoàng Đế Cyber · Lời Thề Của Zane',
      intro: 'Zane tin rằng chiến thắng là con đường duy nhất. Nhưng một sự thật đau đớn đang chờ phía sau.',
      acts: [
        ['Hạng Nhất Học Viện', 'Đàn Em Ngưỡng Mộ', '📘', 'Zane · Kinh điển', ['n:Hàng trăm học sinh vây quanh bảng xếp hạng, tên Zane luôn đứng đầu.', 'e:Đàn anh Zane! Xin chỉ giáo cho em một ván!', 'h:Chỉ một ván. Hãy xem cho kỹ.'], 'e:Em hiểu rồi… khoảng cách còn xa quá.'],
        ['Em Trai Lơ Đãng', 'Syrus', '🌀', 'Jaden · Kinh điển', ['n:Một cậu bé vụng về cố gắng nhìn thẳng vào mắt Zane.', 'e:Anh… em muốn anh công nhận em một lần thôi.', 'h:Muốn được công nhận, em phải thắng. Chứ không phải xin.'], 'e:Em hiểu… nhưng anh cũng đừng quá lạnh lùng.'],
        ['Lời Thách Đấu Của Nhà Vua', 'Yugi Muto', '◈', 'Yugi · Phản công', ['n:Hiệu ứng ánh sáng rực rỡ khi người đàn ông bí ẩn bước vào.', 'e:Tôi nghe nói về Cyber Dragon. Cho tôi xem bài của anh.', 'h:Không cần nói nhiều. Bắt đầu đi.'], 'e:Một bộ bài lạnh lùng nhưng đầy tự trọng.'],
        ['Hầm Thí Nghiệm', 'Giáo Sư Điên', '🧪', 'Zane · Cyberdark', ['n:Hầm ngầm đầy máy móc cũ, mùi dầu nhớt nồng nặc.', 'e:Cyberdark là bước tiến hóa của ngươi, hãy chấp nhận nó!', 'h:Ta không cần ai ép buộc. Ta tự chọn con đường của mình.'], 'e:Ngươi… vẫn còn là con người.'],
        ['Bóng Ma Của Ngày Hôm Qua', 'Jaden Yuki', '🔥', 'Jaden · Phản công', ['n:Một thiếu niên cười tươi bước ra từ ánh sáng.', 'e:Zane, em muốn đấu với anh như ngày nào.', 'h:Em đã lớn rồi. Nhưng anh vẫn chưa thua em.'], 'e:Anh hay thật. Lần sau em sẽ thắng.'],
        ['Trận Cuối: Rồng Máy Tận Diệt', 'Chính Zane Quá Khứ', '💀', 'Zane · Rồng Máy Tận Diệt', ['n:Đối diện anh là một bóng đen giống hệt, nhưng ánh mắt trống rỗng.', 'e:Chiến thắng là tất cả. Hãy từ bỏ cảm xúc.', 'h:Không. Thắng để bảo vệ người mình trân trọng, đó mới là sức mạnh thật.'], 'n:Bóng đen tan biến. Zane nhìn bầu trời, lần đầu tiên mỉm cười.']
      ]
    },
    6: {
      title: 'Nữ Hoàng Harpie · Đôi Cánh Tự Do',
      intro: 'Mai muốn chứng minh rằng người đẹp cũng có thể là kẻ mạnh nhất sân đấu.',
      acts: [
        ['Cú Lướt Đầu Tiên', 'Kẻ Coi Thường', '😏', 'Joey · Kinh điển', ['n:Quán bài nhỏ, một gã đàn ông chế giễu bài Harpie.', 'e:Mấy con chim nhỏ đó mà cũng đòi thắng ai?', 'h:Đợi đã, rồi anh sẽ phải ăn lời đó!'], 'e:Ơ… Harpie mạnh thật đấy.'],
        ['Chị Đại Giải Đấu', 'Joey Wheeler', '🪙', 'Joey · Phản công', ['n:Vòng bán kết, một chàng trai tóc vàng lúc nào cũng tự tin.', 'e:Chị Mai, em sẽ thắng chị nhờ may mắn!', 'h:Nhóc, may mắn không thắng được kỹ năng đâu.'], 'e:Chị đúng là đáng gờm…'],
        ['Rừng Amazoness', 'Nữ Chiến Binh Rừng', '🏹', 'Mai · Phản công', ['n:Rừng rậm yên lặng, tiếng gió xào xạc.', 'e:Ngươi đã bước vào lãnh địa của chúng ta. Chứng minh giá trị đi!', 'h:Ta xin nhận. Harpie sẽ bay qua mọi cánh rừng.'], 'e:Ngươi xứng đáng được phép đi qua.'],
        ['Tình Bạn Và Đối Đầu', 'Yugi Muto', '◈', 'Yugi · Phản công', ['n:Cô thở dài khi nhìn thấy chàng trai bước vào, mắt sáng bình thản.', 'e:Mai, mình chỉ muốn đấu một ván thân thiện thôi.', 'h:Thân thiện à? Ta sẽ không nương tay đâu!'], 'e:Ván đấu rất hay. Cảm ơn Mai.'],
        ['Cơn Bão Cánh Chim', 'Kẻ Săn Chim', '🕸️', 'Pegasus · Phản công', ['n:Lưới bẫy giăng khắp nơi, hắn muốn bắt nữ hoàng Harpie.', 'e:Cánh đẹp như thế nên nhốt trong lồng.', 'h:Ngươi không nhốt được ta. Ta sinh ra để bay!'], 'e:Cánh… quá nhanh…'],
        ['Trận Cuối: Nữ Hoàng Tối Thượng', 'Đối Thủ Số Một', '👑', 'Mai · Tối Thượng', ['n:Khán đài đầy ắp, mọi ánh mắt dồn về hai người.', 'e:Chỉ có một nữ hoàng, và đó sẽ là ta!', 'h:Vậy hãy để cánh chim quyết định!'], 'n:Harpie Queen rực sáng trên bầu trời. Mai giơ tay: “Từ nay, bầu trời này là của chúng ta!”']
      ]
    },
    7: {
      title: 'Chìa Khóa Hy Vọng · Hành Trình Của Yuma',
      intro: 'Cậu bé không biết bỏ cuộc cùng người bạn kỳ lạ từ chiều không gian khác. Hãy thu thập các lá Số.',
      acts: [
        ['Chiếc Chìa Khóa Lạ', 'Kẻ Bắt Nạt', '👊', 'Yuma · Kinh điển', ['n:Trên mái trường, một chiếc chìa khóa phát sáng kéo ra từ ngực cậu.', 'e:Cậu thì làm được gì mà đòi đấu với tớ?', 'h:Tớ không biết! Nhưng tớ sẽ không bỏ cuộc!'], 'e:Chà… cậu nhóc này khác thường thật.'],
        ['Thợ Săn Số', 'Kẻ Gác Cổng Số 9', '🔯', 'Yuma · Kinh điển', ['n:Một lá Số bay qua đầu cậu. Có kẻ đang truy đuổi nó.', 'e:Giao lá Số đó. Không thì đấu với ta!', 'h:Astral nói tớ làm được. Xuất trận!'], 'e:Lá Số… vẫn chưa thuộc về ta…'],
        ['Người Bạn Từ Không Gian', 'Yusei Fudo', '⭐', 'Yusei · Kinh điển', ['n:Một chiếc xe máy dừng lại trước mặt. Người lái nhìn cậu bằng ánh mắt điềm tĩnh.', 'e:Cậu cần học cách tin bài của mình hơn nữa.', 'h:Em sẽ học! Xin chỉ giáo ạ!'], 'e:Em tiến bộ rất nhanh. Cứ giữ vững tinh thần đó.'],
        ['Thế Giới Barian', 'Chiến Binh Barian', '🌌', 'Zane · Cyberdark', ['n:Cổng không gian mở ra, một chiến binh bước ra khỏi ánh sáng tím.', 'e:Số của ngươi sẽ thuộc về ta.', 'h:Số không phải là của ai cả! Nó là bạn của tớ!'], 'e:Tinh thần này… thật nguy hiểm.'],
        ['Utopia Chớp Sáng', 'Nhà Săn Số Thứ Hai', '🗡️', 'Yuma · Utopia', ['n:Hai ánh sáng hòa vào nhau, hình hài rực rỡ hiện ra.', 'e:Utopia sao? Ta sẽ phá nó từ gốc.', 'h:Hy vọng không thể bị phá! Utopia, xuất trận!'], 'e:Ánh sáng đó… không thể dập tắt…'],
        ['Trận Cuối: Nhà Vô Địch', 'Chúa Tể Các Số', '🏆', 'Yuma · Tối Thượng', ['n:Mọi lá Số tụ lại, tạo thành một cơn lốc khổng lồ.', 'e:Ta là chủ nhân của mọi lá Số. Ngươi chẳng là gì!', 'h:Tớ không phải một mình. Hãy cùng nhau, Astral!'], 'n:Cơn lốc tan biến. Yuma và Astral đứng cạnh nhau, nụ cười tỏa sáng.']
      ]
    },
    8: {
      title: 'Rồng Tinh Tú · Con Đường Đồng Bộ',
      intro: 'Dưới thành phố ánh sáng, Yusei chiến đấu để nối lại những gì bị chia cắt.',
      acts: [
        ['Khu Ổ Chuột Satellite', 'Thanh Niên Du Côn', '🔧', 'Yusei · Kinh điển', ['n:Khu ổ chuột ngập mùi dầu máy. Một gã thanh niên chặn đường.', 'e:Đưa đồ nghề đây. Hoặc đấu bài.', 'h:Được. Nhưng tôi sẽ thắng.'], 'e:Chà… tay nghề cao thật.'],
        ['Con Đường Tốc Độ', 'Jaden Yuki', '🔥', 'Jaden · Kinh điển', ['n:Một cậu bé tóc nâu cười toe toét bước tới từ chiếc mô tô cũ.', 'e:Yusei! Em nghe nói anh là cao thủ. Đấu một ván nhé!', 'h:Vui lòng. Anh sẽ nhẹ tay.'], 'e:Haha, anh thật sự giỏi!'],
        ['Đồng Bộ Linh Hồn', 'Kẻ Phá Lưới', '🕷️', 'Zane · Phản công', ['n:Chiếc xe dừng. Trước mặt anh là một cỗ máy khổng lồ.', 'e:Đồng bộ là trò của kẻ yếu. Hãy chống lại máy móc!', 'h:Đồng bộ là kết nối. Và anh sẽ chứng minh điều đó.'], 'e:Kết nối… hóa ra là thế.'],
        ['Rồng Đỏ Xuất Hiện', 'Dấu Ấn Cổ Xưa', '🐲', 'Kaiba · Phản công', ['n:Trên cánh tay Yusei, dấu ấn rồng đỏ bắt đầu phát sáng.', 'e:Ngươi mang dấu của Rồng Đỏ. Chứng minh ngươi xứng đáng!', 'h:Tôi không có lựa chọn nào khác. Đấu thôi!'], 'e:Dấu ấn… đã chọn đúng người.'],
        ['Ngã Ba Số Phận', 'Yuma Tsukumo', '🔑', 'Yuma · Utopia', ['n:Hai người từ hai thế giới gặp nhau.', 'e:Anh Yusei! Em muốn đấu với anh!', 'h:Nhiệt huyết của em làm anh nhớ lại ngày xưa.'], 'e:Anh thật sự là hình mẫu của em!'],
        ['Trận Cuối: Rồng Tinh Tú', 'Kẻ Thù Của Thế Giới', '⭐', 'Yusei · Tối Thượng', ['n:Trên đỉnh tháp thành phố, bầu trời sáng rực pháo hoa.', 'e:Ta sẽ phá hủy mọi kết nối! Ngươi không thể ngăn!', 'h:Mỗi kết nối đều là một lời hứa. Anh sẽ bảo vệ tất cả!'], 'n:Stardust Dragon bay vút lên trời. Thế giới lại được nối liền, rực rỡ như bình minh.']
      ]
    }
  };

  window.MEME_SAGA = { LEVELS, REWARDS, SAGA };
})();
