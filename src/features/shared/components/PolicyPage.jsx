import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Footer from './homepage/Footer';
import Navbar from './homepage/Navbar';

// Accordion Section Component
const AccordionSection = ({
  id,
  title,
  children,
  isExpanded,
  onToggle,
  sectionNumber,
}) => (
  <section id={id} className='mb-6'>
    <div
      className='flex items-center justify-between cursor-pointer p-4 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors'
      onClick={() => onToggle(id)}
    >
      <h2 className='text-xl font-semibold text-foreground'>
        {sectionNumber}. {title}
      </h2>
      {isExpanded ? (
        <ChevronDown className='h-5 w-5 text-muted-foreground' />
      ) : (
        <ChevronRight className='h-5 w-5 text-muted-foreground' />
      )}
    </div>
    {isExpanded && (
      <div className='mt-4 p-4 bg-muted/30 rounded-lg'>
        <div className='space-y-4 text-muted-foreground'>{children}</div>
      </div>
    )}
  </section>
);

const policySections = [
  { id: 'introduction', title: 'Giới thiệu' },
  { id: 'data-protection', title: 'Bảo vệ dữ liệu' },
  { id: 'user-rights', title: 'Quyền & Trách nhiệm' },
  { id: 'account-management', title: 'Quản lý tài khoản' },
  { id: 'vehicle-rental', title: 'Điều khoản thuê xe' },
  { id: 'booking-payment', title: 'Chính sách đặt xe' },
  { id: 'out-of-area', title: 'Chính sách ngoài khu vực' },
  { id: 'station-management', title: 'Quản lý trạm' },
  { id: 'staff-management', title: 'Quản lý nhân viên' },
  { id: 'vehicle-usage', title: 'Hướng dẫn sử dụng' },
  { id: 'liability-insurance', title: 'Trách nhiệm & Bảo hiểm' },
  { id: 'dispute-resolution', title: 'Giải quyết tranh chấp' },
  { id: 'violation-enforcement', title: 'Vi phạm & Thực thi' },
  { id: 'general-terms', title: 'Điều khoản chung' },
];

export default function PolicyPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [expandedSections, setExpandedSections] = useState({
    introduction: true,
    'data-protection': false,
    'user-rights': false,
    'account-management': false,
    'vehicle-rental': false,
    'booking-payment': false,
    'out-of-area': false,
    'station-management': false,
    'staff-management': false,
    'vehicle-usage': false,
    'liability-insurance': false,
    'dispute-resolution': false,
    'violation-enforcement': false,
    'general-terms': false,
  });

  const scrollToSection = sectionId => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleSection = sectionId => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar />

      <div className='flex min-h-[calc(100vh-80px)] mt-20'>
        {/* Sidebar */}
        <div className='w-80 bg-muted/30 border-r border-border flex-shrink-0'>
          <div className='p-6'>
            <h2 className='text-xl font-bold text-foreground mb-6'>
              Chính sách & Quy định
            </h2>
            <nav className='space-y-2'>
              {policySections.map(section => (
                <button
                  key={section.id}
                  onClick={() => {
                    scrollToSection(section.id);
                    toggleSection(section.id);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-muted text-foreground border-l-4 border-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className='text-left'>{section.title}</span>
                  {expandedSections[section.id] ? (
                    <ChevronDown className='h-4 w-4' />
                  ) : (
                    <ChevronRight className='h-4 w-4' />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 bg-background overflow-y-auto'>
          <div className='max-w-4xl mx-auto p-8'>
            <h1 className='text-3xl font-bold text-foreground mb-8'>
              Chính sách & Quy định EV-Rental
            </h1>

            {/* Introduction */}
            <AccordionSection
              id='introduction'
              title='Giới thiệu'
              sectionNumber={1}
              isExpanded={expandedSections.introduction}
              onToggle={toggleSection}
            >
              <p>
                <strong>1.1 Về nền tảng EV-Rental</strong>
                <br />
                Chào mừng đến với nền tảng EV-Rental, dịch vụ cho thuê xe điện
                sáng tạo cung cấp giải pháp giao thông bền vững. Bằng việc truy
                cập và sử dụng nền tảng EV-Rental, tạo tài khoản, hoặc sử dụng
                dịch vụ của chúng tôi, bạn đồng ý tuân thủ các Điều khoản và
                Điều kiện này cùng tất cả các chính sách áp dụng.
              </p>
              <p>
                <strong>1.2 Phạm vi dịch vụ</strong>
                <br />
                Nền tảng EV-Rental cho phép khách hàng:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Duyệt và thuê xe điện từ nhiều trạm</li>
                <li>Quản lý đặt xe và thanh toán qua nền tảng số</li>
                <li>Truy cập hỗ trợ khách hàng và dịch vụ bảo trì xe</li>
                <li>
                  Tham gia chương trình khuyến mãi và phần thưởng trung thành
                </li>
              </ul>
              <p>
                <strong>1.3 Quyền của nền tảng</strong>
                <br />
                EV-Rental có quyền:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>
                  Thay đổi, cập nhật, tạm dừng hoặc chấm dứt bất kỳ điều khoản
                  và điều kiện nào bất cứ lúc nào
                </li>
                <li>
                  Từ chối yêu cầu dịch vụ hoặc tạo tài khoản theo yêu cầu pháp
                  lý
                </li>
                <li>
                  Cập nhật dịch vụ và giá cả dựa trên điều kiện thị trường
                </li>
              </ul>
            </AccordionSection>

            {/* Data Protection */}
            <AccordionSection
              id='data-protection'
              title='Bảo vệ dữ liệu và Chính sách riêng tư'
              sectionNumber={2}
              isExpanded={expandedSections['data-protection']}
              onToggle={toggleSection}
            >
              <p>
                <strong>2.1 Thu thập và xử lý dữ liệu</strong>
                <br />
                EV-Rental cam kết bảo vệ dữ liệu cá nhân của người dùng. Chúng
                tôi thu thập và xử lý thông tin sau:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>
                  Dữ liệu định danh cá nhân (tên, số điện thoại, địa chỉ, ngày
                  sinh)
                </li>
                <li>Thông tin đăng nhập tài khoản (email, mật khẩu)</li>
                <li>
                  Thông tin tài chính (phương thức thanh toán, lịch sử giao
                  dịch)
                </li>
                <li>Dữ liệu sử dụng xe (lịch sử thuê, đánh giá, phản hồi)</li>
                <li>Dữ liệu vị trí để theo dõi trạm và xe</li>
              </ul>
              <p>
                <strong>2.2 Sử dụng dữ liệu</strong>
                <br />
                Dữ liệu của bạn được sử dụng để:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Quản lý tài khoản và xác thực</li>
                <li>Xử lý đặt xe và thanh toán</li>
                <li>Cải thiện dịch vụ và hỗ trợ khách hàng</li>
                <li>Giám sát an toàn và bảo mật</li>
                <li>Tuân thủ pháp luật và yêu cầu kiểm toán</li>
              </ul>
            </AccordionSection>

            {/* User Rights */}
            <AccordionSection
              id='user-rights'
              title='Quyền và Trách nhiệm của Người dùng'
              sectionNumber={3}
              isExpanded={expandedSections['user-rights']}
              onToggle={toggleSection}
            >
              <p>
                <strong>3.1 Quyền của người dùng</strong>
                <br />
                Người dùng đã đăng ký có quyền:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Truy cập xe có sẵn và đặt chỗ</li>
                <li>Nhận hỗ trợ kỹ thuật và hướng dẫn sử dụng nền tảng</li>
                <li>Đưa ra phản hồi và gợi ý cải thiện dịch vụ</li>
                <li>Yêu cầu cập nhật thông tin tài khoản và xóa dữ liệu</li>
                <li>Được đối xử công bằng và dịch vụ không phân biệt đối xử</li>
              </ul>
              <p>
                <strong>3.2 Trách nhiệm của người dùng</strong>
                <br />
                Người dùng phải:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Duy trì bảo mật tài khoản và báo cáo truy cập trái phép</li>
                <li>Cung cấp thông tin chính xác và trung thực</li>
                <li>Tuân thủ tất cả luật pháp và quy định áp dụng</li>
                <li>
                  Sử dụng xe có trách nhiệm và trả xe trong tình trạng tốt
                </li>
                <li>Thanh toán tất cả phí và chi phí đúng hạn</li>
              </ul>
            </AccordionSection>

            {/* Account Management */}
            <AccordionSection
              id='account-management'
              title='Quản lý Tài khoản và Bảo mật'
              sectionNumber={4}
              isExpanded={expandedSections['account-management']}
              onToggle={toggleSection}
            >
              <p>
                <strong>4.1 Tạo tài khoản</strong>
                <br />
                Để tạo tài khoản, người dùng phải:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Ít nhất 21 tuổi với bằng lái xe hợp lệ</li>
                <li>Cung cấp thông tin cá nhân và liên lạc chính xác</li>
                <li>Xác minh danh tính qua nộp tài liệu</li>
                <li>Đồng ý với tất cả điều khoản và điều kiện</li>
              </ul>
              <p>
                <strong>4.2 Bảo mật tài khoản</strong>
                <br />
                Người dùng có trách nhiệm:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Giữ bí mật thông tin đăng nhập</li>
                <li>Đăng xuất sau mỗi phiên trên thiết bị dùng chung</li>
                <li>Báo cáo ngay lập tức hoạt động tài khoản đáng ngờ</li>
                <li>Cập nhật thông tin tài khoản khi có thay đổi</li>
              </ul>
            </AccordionSection>

            {/* Vehicle Rental */}
            <AccordionSection
              id='vehicle-rental'
              title='Điều khoản Thuê xe'
              sectionNumber={5}
              isExpanded={expandedSections['vehicle-rental']}
              onToggle={toggleSection}
            >
              <p>
                <strong>5.1 Loại xe và Tính khả dụng</strong>
                <br />
                EV-Rental cung cấp các loại xe điện khác nhau:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Sedan, SUV, Hatchback, Coupe</li>
                <li>Dung lượng pin và khả năng di chuyển khác nhau</li>
                <li>
                  Tính khả dụng của xe phụ thuộc vào nhu cầu và lịch bảo trì
                </li>
              </ul>
              <p>
                <strong>5.2 Yêu cầu thuê xe</strong>
                <br />
                Để thuê xe, người dùng phải:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Có tài khoản đang hoạt động, đã xác minh</li>
                <li>Có bằng lái xe hợp lệ</li>
                <li>Đáp ứng yêu cầu tuổi tối thiểu (21+)</li>
                <li>Cung cấp phương thức thanh toán hợp lệ</li>
                <li>Hoàn thành kiểm tra xe trước khi sử dụng</li>
              </ul>
            </AccordionSection>

            {/* Booking and Payment */}
            <AccordionSection
              id='booking-payment'
              title='Chính sách Đặt xe và Thanh toán'
              sectionNumber={6}
              isExpanded={expandedSections['booking-payment']}
              onToggle={toggleSection}
            >
              <p>
                <strong>6.1 Quy trình đặt xe</strong>
                <br />
                Đặt chỗ có thể được thực hiện qua nền tảng trước tối đa 30 ngày.
                Đặt chỗ yêu cầu thanh toán ngay lập tức hoặc ủy quyền thanh toán
                hợp lệ. Hủy bỏ phải được thực hiện ít nhất 2 giờ trước giờ nhận
                xe. Không xuất hiện sẽ dẫn đến phí đầy đủ và có thể bị phạt tài
                khoản.
              </p>
              <p>
                <strong>6.2 Phương thức thanh toán</strong>
                <br />
                Các phương thức thanh toán được chấp nhận bao gồm:
              </p>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Thẻ tín dụng (Visa, MasterCard, American Express)</li>
                <li>Thẻ ghi nợ</li>
                <li>Chuyển khoản ngân hàng</li>
                <li>Ví điện tử (nếu có)</li>
                <li>Thanh toán bằng tiền mặt tại một số địa điểm</li>
              </ul>
            </AccordionSection>

            {/* Out of Area Policy */}
            <AccordionSection
              id='out-of-area'
              title='Chính sách Ngoài Khu vực của EV-Rental'
              sectionNumber={7}
              isExpanded={expandedSections['out-of-area']}
              onToggle={toggleSection}
            >
              <p>
                Việc sử dụng xe chủ yếu dành cho Khu vực Đô thị Thành phố Hồ Chí
                Minh. Việc di chuyển ra ngoài khu vực này được phép nhưng mang
                theo rủi ro, trách nhiệm và phí bổ sung.
              </p>
              <p>
                <strong>7.1 Yêu cầu Di chuyển</strong>
                <br />
                Thông báo trước cho EV-Rental là bắt buộc cho bất kỳ chuyến đi
                nào ra ngoài Thành phố Hồ Chí Minh. Có thể yêu cầu tiền đặt cọc
                bổ sung. Khách hàng thừa nhận và chịu trách nhiệm cá nhân và
                trách nhiệm pháp lý tăng lên cho an toàn và bảo mật xe.
              </p>
              <p>
                <strong>7.2 Hỗ trợ Khẩn cấp và Bên đường</strong>
                <br />
                Hỗ trợ khẩn cấp và hỗ trợ bên đường có thể bị hạn chế hoặc không
                có sẵn ngoài khu vực dịch vụ được chỉ định. Phí bổ sung sẽ áp
                dụng cho bất kỳ sự cố, phục hồi hoặc dịch vụ nào được yêu cầu
                ngoài Thành phố Hồ Chí Minh. Phí phụ trội phản ứng khẩn cấp:
                3.000.000 VNĐ cho các sự cố ngoài TP.HCM.
              </p>
            </AccordionSection>

            {/* Station Management */}
            <AccordionSection
              id='station-management'
              title='Quản lý Trạm và Vận hành'
              sectionNumber={8}
              isExpanded={expandedSections['station-management']}
              onToggle={toggleSection}
            >
              <p>
                <strong>8.1 Vị trí Trạm và Giờ hoạt động</strong>
                <br />
                Các trạm được đặt chiến lược trong khu vực dịch vụ Thành phố Hồ
                Chí Minh. Giờ hoạt động khác nhau theo địa điểm (24/7 hoặc giờ
                hạn chế). Cập nhật trạng thái trạm có sẵn theo thời gian thực.
                Thời gian bảo trì có thể ảnh hưởng đến tính khả dụng.
              </p>
              <p>
                <strong>8.2 Nhận và Trả xe</strong>
                <br />
                Xe phải được nhận và trả tại các trạm được chỉ định trong Thành
                phố Hồ Chí Minh. Yêu cầu trả cùng trạm trừ khi có thỏa thuận
                khác. Trả trạm khác phải chịu phí bổ sung. Nhận/trả ngoài giờ có
                sẵn tại một số địa điểm.
              </p>
            </AccordionSection>

            {/* Staff Management */}
            <AccordionSection
              id='staff-management'
              title='Quản lý Nhân viên và Ủy quyền'
              sectionNumber={9}
              isExpanded={expandedSections['staff-management']}
              onToggle={toggleSection}
            >
              <p>
                <strong>9.1 Vai trò và Trách nhiệm của Nhân viên</strong>
                <br />
                <strong>Nhân viên Admin:</strong> Truy cập hệ thống đầy đủ và
                quản lý người dùng, quản lý trạm và xe, thực thi chính sách và
                giải quyết tranh chấp, giám sát tài chính và báo cáo.
              </p>
              <p>
                <strong>Nhân viên Trạm:</strong> Kiểm tra xe và phối hợp bảo
                trì, hỗ trợ và hỗ trợ khách hàng, quản lý vận hành trạm, báo cáo
                sự cố và giải quyết.
              </p>
            </AccordionSection>

            {/* Vehicle Usage */}
            <AccordionSection
              id='vehicle-usage'
              title='Hướng dẫn Sử dụng và An toàn Xe'
              sectionNumber={10}
              isExpanded={expandedSections['vehicle-usage']}
              onToggle={toggleSection}
            >
              <p>
                <strong>10.1 Yêu cầu Tài xế</strong>
                <br />
                Bằng lái xe hợp lệ được yêu cầu mọi lúc. Hạn chế tuổi: tối thiểu
                21 tuổi. Tài xế quốc tế phải có tài liệu phù hợp. Sử dụng thương
                mại yêu cầu ủy quyền đặc biệt.
              </p>
              <p>
                <strong>10.2 Vận hành Xe</strong>
                <br />
                Số lượng hành khách tối đa theo quy định cho mỗi xe. Không hút
                thuốc, thú cưng hoặc chất cấm. Dây an toàn bắt buộc cho tất cả
                hành khách. Sử dụng điện thoại di động chỉ với thiết bị rảnh
                tay.
              </p>
            </AccordionSection>

            {/* Liability and Insurance */}
            <AccordionSection
              id='liability-insurance'
              title='Trách nhiệm và Bảo hiểm'
              sectionNumber={11}
              isExpanded={expandedSections['liability-insurance']}
              onToggle={toggleSection}
            >
              <p>
                <strong>11.1 Bảo hiểm</strong>
                <br />
                Tất cả xe thuê bao gồm bảo hiểm toàn diện trong Thành phố Hồ Chí
                Minh: Bảo hiểm toàn diện đầy đủ, bảo vệ trách nhiệm bên thứ ba,
                bảo vệ trộm cắp và phá hoại, hỗ trợ khẩn cấp bên đường, dịch vụ
                phục hồi xe, hỗ trợ phản ứng tai nạn.
              </p>
              <p>
                <strong>11.2 Trách nhiệm Người dùng</strong>
                <br />
                Người dùng chịu trách nhiệm cho: Hư hỏng ngoài hao mòn bình
                thường, vi phạm giao thông và phí phạt phát sinh trong thời gian
                thuê, trộm cắp do sơ suất hoặc bảo mật không đúng cách, số lượng
                hành khách vượt quá sức chứa xe.
              </p>
            </AccordionSection>

            {/* Dispute Resolution */}
            <AccordionSection
              id='dispute-resolution'
              title='Giải quyết Tranh chấp'
              sectionNumber={12}
              isExpanded={expandedSections['dispute-resolution']}
              onToggle={toggleSection}
            >
              <p>
                <strong>12.1 Khiếu nại Khách hàng</strong>
                <br />
                Khiếu nại nên được gửi: Qua hệ thống hỗ trợ của nền tảng, qua
                email đến support@ev-rental.com, qua điện thoại trong giờ làm
                việc, bằng văn bản đến trung tâm dịch vụ khách hàng của chúng
                tôi.
              </p>
              <p>
                <strong>12.2 Quy trình Giải quyết</strong>
                <br />
                Phản hồi ban đầu trong vòng 24 giờ, điều tra và tìm hiểu sự
                thật, đề xuất giải pháp trong vòng 5 ngày làm việc, thực hiện
                giải pháp đã thỏa thuận, theo dõi để đảm bảo hài lòng.
              </p>
            </AccordionSection>

            {/* Violation and Enforcement */}
            <AccordionSection
              id='violation-enforcement'
              title='Vi phạm và Thực thi'
              sectionNumber={13}
              isExpanded={expandedSections['violation-enforcement']}
              onToggle={toggleSection}
            >
              <p>
                <strong>13.1 Phân loại Vi phạm</strong>
                <br />
                <strong>Vi phạm Nhẹ:</strong> Trả muộn (lên đến 1 giờ), vấn đề
                vệ sinh xe nhỏ, không báo cáo hư hỏng nhỏ.
              </p>
              <p>
                <strong>Vi phạm Nặng:</strong> Hư hỏng tài sản đáng kể, sử dụng
                xe bất hợp pháp, gian lận hoặc cung cấp thông tin sai, vi phạm
                an toàn.
              </p>
              <p>
                <strong>Vi phạm Nghiêm trọng:</strong> Hoạt động tội phạm sử
                dụng xe, vi phạm nặng lặp lại, hành vi đe dọa đối với nhân viên,
                hư hỏng hoặc trộm cắp có chủ ý.
              </p>
            </AccordionSection>

            {/* General Terms */}
            <AccordionSection
              id='general-terms'
              title='Điều khoản Chung'
              sectionNumber={14}
              isExpanded={expandedSections['general-terms']}
              onToggle={toggleSection}
            >
              <p>
                <strong>14.1 Cập nhật Chính sách</strong>
                <br />
                EV-Rental có quyền cập nhật các chính sách này bất cứ lúc nào.
                Người dùng sẽ được thông báo về những thay đổi đáng kể thông
                qua: Thông báo nền tảng, thông báo email, cập nhật trang web,
                tin nhắn trong ứng dụng.
              </p>
              <p>
                <strong>14.3 Thông tin Liên hệ</strong>
                <br />
                Dịch vụ Khách hàng EV-Rental
                <br />
                Email: support@ev-rental.com
                <br />
                Điện thoại: 1900 EVRENTAL (1900 387 3682)
                <br />
                Website: www.ev-rental.com
                <br />
                Địa chỉ: 100 Lê Lợi, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh,
                Việt Nam
              </p>
            </AccordionSection>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
